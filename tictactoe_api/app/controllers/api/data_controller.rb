class Api::DataController < ApplicationController
	
	def options
		head :ok
	end
	
	print ("======= DATA RECIEVED ======\n")
	def save
	  # Assuming the array is sent with the key 'array_data'
	  received_array = params[:game_data]
	  
	  # You can process the array as needed, here's a simple print to server logs
	  puts "Received array: #{received_array.inspect}"
  
	  # Respond back with a success message
	  render json: { status: 'success', message: 'Array received', data: received_array }
	rescue => e
	  render json: { status: 'error', message: e.message }
	end
end
