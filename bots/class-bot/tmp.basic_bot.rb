require 'nutella_lib'


# Parse command line arguments
broker, app_id, run_id = nutella.app.parse_args ARGV
# Extract the component_id
component_id = nutella.extract_component_id
# Initialize nutella
nutella.app.init(broker, app_id, component_id)
# (Optional) Set the resourceId
nutella.app.set_resource_id 'my_resource_id'

clusters = nutella.app.persist.get_json_object_store('clusters')

if clusters.empty?
  clusters['data'] = Array[];
end



currentClass = nutella.app.persist.get_json_object_store('currentClass')

# currentRun['class'] = 'default'
if currentClass.empty?
    currentClass['ID'] = 1
    currentClass['name'] = 'none'
end

classes = nutella.app.persist.get_json_object_store('classes')

if classes.empty?
  classes['topID'] = 2
  item1 = Hash.new
  item1['ID'] = 1
  item1['name'] = 'none'

# this hack (below) is necessary because you can't listen for requests from all runs

  item2 = Hash.new
  item2['ID'] = 2
  item2['name'] = 'default'

  classes['classList'] = Array[item1,item2]
end

# # this doesn't work:

# nutella.app.net.handle_requests_on_all_runs('get_current_class', lambda do |request, run_id, from|
#                                                 reply = currentClass ['data']
#                                                 reply
#                                                end)
# # so my workaround is:

  # nutella.app.net.handle_requests_on_all_runs('get_current_class', lambda do |request, run_id, from|
  #                                               # reply = currentClass['name']
  #                                               reply = Hash.new
  #                                               reply['ID'] = currentClass['ID']
  #                                               reply['name'] = currentClass['name']
  #                                               reply
  #                                              end)


classes['classList'].each do |thisclass|
  nutella.app.net.handle_requests_on_run(thisclass['name'],'get_current_class', lambda do |request, from|
                                                reply = Hash.new
                                                reply['ID'] = currentClass['ID']
                                                reply['name'] = currentClass['name']
                                                reply
                                               end)
  nutella.app.net.handle_requests_on_run(thisclass['name'],'get_classes', lambda do |request, from|
                                                reply = Hash.new
                                                reply['topID'] = classes['topID']
                                                reply['classList'] = classes['classList']
                                                reply
                                               end)
  nutella.app.net.subscribe_to_run(thisclass['name'],'set_current_class', lambda do |request, from|
                                                # reply = currentClass['name']
                                                currentClass['ID'] = request['ID']
                                                currentClass['name'] = request['name']
                                                nutella.app.net.publish_to_all_runs('current_class_set',request['name'])
                                               end)
  nutella.app.net.subscribe_to_run(thisclass['name'],'set_classes', lambda do |request, from|
                                              # reply = currentClass['name']
                                              classes['topID'] = request['topID']
                                              classes['classList'] = request['classList']
                                              nutella.app.net.publish_to_all_runs('classes_set',0)
                                             end)

end


nutella.app.net.listen
