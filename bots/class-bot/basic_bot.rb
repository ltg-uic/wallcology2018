require 'nutella_lib'

puts 'alive'
# Parse command line arguments
broker, app_id, run_id = nutella.app.parse_args ARGV
# Extract the component_id
component_id = nutella.extract_component_id
# Initialize nutella
nutella.app.init(broker, app_id, component_id)
# (Optional) Set the resourceId
nutella.app.set_resource_id 'my_resource_id'



clusters = nutella.app.persist.get_json_object_store('clusters')
current = nutella.app.persist.get_json_object_store('current')


# if clusters.empty?
#   clusters['data'] = Array[];
# end

# {"data":[{"list":["7X","7Y"],"current":"7X"}]}
# puts clusters['data'][0]['current']


# currentClass = nutella.app.persist.get_json_object_store('currentClass')

# # currentRun['class'] = 'default'
# if currentClass.empty?
#     currentClass['ID'] = 1
#     currentClass['name'] = 'none'
# end

# classes = nutella.app.persist.get_json_object_store('classes')

# if classes.empty?
#   classes['topID'] = 2
#   item1 = Hash.new
#   item1['ID'] = 1
#   item1['name'] = 'none'

# # this hack (below) is necessary because you can't listen for requests from all runs

#   item2 = Hash.new
#   item2['ID'] = 2
#   item2['name'] = 'default'

#   classes['classList'] = Array[item1,item2]
# end





# interfaces (client)

# A. nutella.net.request("get_cluster_info", run_id, function(message){}) // used by roomcast

# message.run_ids: [integer, integer, …]
# message.current_run_id: string

# returns the array of running run_ids and current run_id. if the current_run_id is not currenty running, run_id is made the current_run_id. 

# needs to return status and data. empty array means the run_id is an asynchronous run.

# B. nutella.net.request("set_cluster_current",{cluster: 1, current_run_id: "7Y},function(confirmation){})//
# called from any run_id, like the above,

# returns confirmation, a return variable indicating whether the change happened. For example, a run might go down but 
# still be in an interface menu. confirmation: "success", "not_in_cluster","not_running"


for cluster_record in clusters['data']
    nutella.app.net.handle_requests_on_run(cluster_record['run_id'],'get_cluster_info', lambda do |run_id, from|

puts 'got here'
                                              reply = Hash.new
                                              reply['run_ids'] =  Array[]


# figure out which cluster this run_id is in

                                              this_cluster_id = 0
                                              for item in clusters['data']
                                                if item['run_id'] == run_id
                                                  this_cluster_id = item['cluster_id']
                                                end
                                              end


# if you can't find this run_id, it doesn't belong to any cluster (asynchronous), so just return the run_id 


                                              if this_cluster_id == 0
                                                reply['current_run_id'] = run_id
                                                reply['status'] = 'current_run_id_not_part_of_any_cluster'
                                                reply
                                                return
                                              end

# if we get here, we've found the cluster_id. now let's find all run_ids in this cluster.

                                              this_cluster_id_list = Array[]
                                              for item in clusters['data']
                                                if item['cluster_id'] == this_cluster_id
                                                  this_cluster_id_list.push(item['run_id'])
                                                end
                                              end



# note: this list cannot be empty. at the minimum it 
# contains the calling run_id for any run_id the belongs to a cluster

                                              reply['run_ids'] = this_cluster_id_list


# now let's find out which run_id is currently active in this cluster

                                              current_run_id = ''
                                              for item in current['data']
                                                if item['cluster_id'] == this_cluster_id
                                                  current_run_id = item['current_run_id']
                                                end
                                              end

                                              # puts current_run_id

# if you didn't find one, add a new record to the 'current' store

                                              if current_run_id == ''
                                                parm = Hash.new
                                                parm['cluster_id'] = this_cluster_id
                                                parm['run_id'] = current_run_id
                                                current['data'].push(parm)
                                              end

                                              reply['current_run_id'] = current_run_id
                                              reply['status'] = 'success'
                                              reply
                                       end)


    nutella.app.net.subscribe_to_run(cluster_record['run_id'],'set_cluster_current_run_id', lambda do |new_run_id, from|

                                              reply = Hash.new
                                              reply['source_run_id'] = from['run_id']
                                              reply['proposed_run_id'] = new_run_id

# figure out which cluster the new run_id is in

                                              proposed_cluster_id = 0
                                              for item in clusters['data']
                                                if item['run_id'] == new_run_id
                                                  proposed_cluster_id = item['cluster_id']
                                                end
                                              end

# if you can't find this run_id, it doesn't belong to any cluster (asynchronous), so just return the run_id 


                                              if proposed_cluster_id == 0
                                                reply['status'] = "designated_run_id_not_part_of_any_cluster"
                                                nutella.app.net.publish_to_all_runs('current_class_set',reply)
                                                return
                                              end

# figure out which cluster the calling run_id is in

                                              current_cluster_id = 0
                                              for item in clusters['data']
                                                if item['run_id'] == from['run_id']
                                                  current_cluster_id = item['cluster_id']
                                                end
                                              end

# if you can't find this run_id, it doesn't belong to any cluster (asynchronous), so just return the run_id 


                                              if current_cluster_id == 0
                                                reply['status'] = "current_run_id_not_part_of_any_cluster"
                                                nutella.app.net.publish_to_all_runs('current_class_set',reply)
                                                return
                                              end

# are the source run_id and destination run_ids part of the same cluster?
puts current_cluster_id
puts proposed_cluster_id


                                              if current_cluster_id != proposed_cluster_id
                                                reply['status'] = "designated_run_id_not_part_of_this_cluster"
                                                nutella.app.net.publish_to_all_runs('current_class_set',reply)
                                                return
                                              end

# now let's find out which run_id is currently active in this cluster and update it

# check to see if the target run_id is currently running

                                              current_runs = `cd ../..; nutella runs`
                                              test = Array[]
                                              test = current_runs.lines
                                              test.shift
                                              active = false
                                              for item in test
                                                temp = item.lstrip.chop
                                                puts temp
                                                if temp == new_run_id
                                                  active = true
                                                end
                                              end

                                              if !active
                                                reply['status'] = 'run_id_not_currently_active'
                                                nutella.app.net.publish_to_all_runs('current_class_set',reply)
                                                return
                                              end

# return success so long as you find the target cluster

                                              ctemp = Array[];
                                              ctemp = current['data']


                                              i=0
                                              while i<ctemp.length

                                                if ctemp[i]['cluster_id'] == current_cluster_id
                                                  ctemp[i]['current_run_id'] = new_run_id
                                                end
                                                i=i+1
                                              end

                                              puts ctemp
                                              current['data'] = ctemp
                                              reply['status'] = 'success'
                                              nutella.app.net.publish_to_all_runs('current_class_set',reply)
                                              return

                                              # for item in current['data']
                                              #   if item['cluster_id'] == current_cluster_id
                                              #     item['current_run_id'] = new_run_id
                                              #     puts item
                                              #     reply['status'] = 'success'
                                              #     # reply
                                              #     current['data'][0]['current_run_id'] = new_run_id
                                              #     nutella.app.net.publish_to_all_runs('current_class_set',reply)
                                              #     return
                                              #   end
                                              # end

# error if cluster not found

                                              reply['status'] = 'cluster_missing_in_current_table'
                                              nutella.app.net.publish_to_all_runs('current_class_set',reply)
                                              return
                                              
                                      end)

end


# C. nutella.net.request("get_all_cluster_info",{},function(cluster_info){})

# return clusters.data


# we will only allow this message to be received from the run called 'roomcast' (our admin run), so we only have to listen on the server end for that one run_id rather than doing it for all like A. and B. D works like C, too. only the 'roomcast' run can access the full set of clusters, or update it. this request does not impact the current_run_id for a cluster; that's run-level thing.

# D. nutella.net.request("set_all_cluster_info",{},function(cluster_info){})

# cluster.data = cluster_info

nutella.app.net.handle_requests_on_run('roomcast','get_all_cluster_info', lambda do |dummy, from|

                                              return clusters['data']
                                              
                                        end)

nutella.app.net.handle_requests_on_run('roomcast','set_all_cluster_info', lambda do |message, from|

                                              clusters['data'] = message
                                              
                                        end)

# copy = `cd ../roomcast-bot/data/time; ln -f ../another/activities.json activities.json`

# # copy = `cp bots/roomcast-bot/data/another/* bots/roomcast-bot/data/time/`
# puts copy

# "abc \0\0abc \0\0".unpack('A6Z6')   #=> ["abc", "abc "]
# "abc \0\0".unpack('a3a3')           #=> ["abc", " \000\000"]
# "abc \0abc \0".unpack('Z*Z*')       #=> ["abc ", "abc "]
# "aa".unpack('b8B8')                 #=> ["10000110", "01100001"]
# "aaa".unpack('h2H2c')               #=> ["16", "61", 97]
# "\xfe\xff\xfe\xff".unpack('sS')     #=> [-2, 65534]
# "now = 20is".unpack('M*')           #=> ["now is"]
# "whole".unpack('xax2aX2aX1aX2a')    #=> ["h", "e", "l", "l", "o"]


nutella.app.net.listen
