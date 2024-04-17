class Api::GameChannel < ApplicationCable::Channel
	class GameChannel < ApplicationCable::Channel
	def subscribed
		# Each game has a unique identifier, e.g., "game_1"
		stream_from "game_#{params[:game_id]}"
	end
	  
	def unsubscribed
		# Any cleanup needed when channel is unsubscribed
	end
	  

	def make_move(data)
		# Broadcast the move to all subscribers of this game's channel
		ActionCable.server.broadcast("game_#{params[:game_id]}", data)
	end

end
