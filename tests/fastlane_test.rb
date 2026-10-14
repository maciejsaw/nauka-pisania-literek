# Exercise the real publishing lane bodies; all store actions are recorded, never executed.
class LaneProbe
  attr_reader :calls
  def initialize
    @lanes = {}
    @calls = []
  end
  def platform(name)
    @platform = name
    yield
  end
  def desc(*)
  end
  def lane(name, &body)
    @lanes[[@platform, name]] = body
  end
  def method_missing(name, options = {})
    allowed = [:app_store_connect_api_key, :upload_to_testflight, :upload_to_app_store, :upload_to_play_store]
    raise "Unexpected action: #{name}" unless allowed.include?(name)
    @calls << [name, options]
    name == :app_store_connect_api_key ? :test_api : nil
  end
  def run(platform, channel)
    ENV['RELEASE_CHANNEL'] = channel
    @calls.clear
    @lanes.fetch([platform, :publish]).call
    @calls
  end
end

def check(condition, description)
  raise description unless condition
end

probe = LaneProbe.new
file = File.expand_path('../fastlane/Fastfile', __dir__)
probe.instance_eval(File.read(file), file)
# Fake values are local to this test process, not real credentials.
ENV['ASC_KEY_ID'] = 'test-key'
ENV['ASC_ISSUER_ID'] = 'test-issuer'
ENV['ASC_KEY_P8_BASE64'] = 'test-placeholder'
ENV['APP_VERSION'] = '1.2.3'
ENV['IOS_BUILD_NUMBER'] = '102.3.99'
ENV['GOOGLE_PLAY_JSON_PATH'] = '/tmp/nonexistent-test-account.json'
ENV['REVIEW_CONTACT_JSON'] = '{"firstName":"Test","lastName":"Reviewer","email":"review@example.com","phone":"+48123456789"}'

calls = probe.run(:ios, 'beta')
check(calls.map(&:first) == [:app_store_connect_api_key, :upload_to_testflight], 'iOS beta must never submit to App Review')
check(calls.last[1][:distribute_external] == false, 'beta stays in internal testing')
calls = probe.run(:ios, 'production')
check(calls.map(&:first) == [:app_store_connect_api_key, :upload_to_app_store], 'iOS production must use App Store upload')
options = calls.last[1]
check(options[:submit_for_review] && options[:automatic_release], 'production must request review and release after acceptance')
check(options[:build_number] == '102.3.99' && options[:app_version] == '1.2.3', 'Apple must use the dotted iOS build, not Android versionCode')
check(options[:app_review_information][:email_address] == 'review@example.com', 'review contact mapping')
check(options[:ipa].end_with?('/build/ios/Pajaczek.ipa'), 'publish must use the packaged IPA')

calls = probe.run(:android, 'beta')
check(calls.map(&:first) == [:upload_to_play_store], 'Android beta action')
options = calls.last[1]
check(options[:track] == 'internal' && options[:skip_upload_metadata] && options[:skip_upload_screenshots], 'beta must not modify production listing')
calls = probe.run(:android, 'production')
options = calls.last[1]
check(options[:track] == 'production' && options[:release_status] == 'completed', 'Android production track')
check(!options[:skip_upload_metadata] && !options[:skip_upload_images] && !options[:skip_upload_screenshots], 'production must include listing materials')
check(options[:aab].end_with?('/build/android/Pajaczek.aab'), 'publish must use the packaged AAB')
[:ios, :android].each do |platform|
  begin
    probe.run(platform, 'typo')
    raise 'Unexpected release channel was accepted'
  rescue RuntimeError => error
    raise unless error.message.include?('RELEASE_CHANNEL')
    check(probe.calls.empty?, 'unknown channel must fail before any store action')
  end
end
puts '6 publishing scenarios passed (store calls mocked; nothing uploaded).'
