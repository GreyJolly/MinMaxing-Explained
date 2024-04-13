class Api::DataController < ApplicationController

	def options
		head :ok
	end

	def save
		# Assuming the array is sent with the key 'game_data'
		received_array = params[:game_data]

		game = GamesPlayed.create(
			x_author: received_array.fetch(0, nil),
			o_author: received_array.fetch(1, nil),
			winner: received_array.fetch(2, nil),
			firstMove: received_array.fetch(3, nil),
			secondMove: received_array.fetch(4, nil),
			thirdMove: received_array.fetch(5, nil),
			fourthMove: received_array.fetch(6, nil),
			fifthMove: received_array.fetch(7, nil),
			sixthMove: received_array.fetch(8, nil),
			seventhMove: received_array.fetch(9, nil),
			eigthMove: received_array.fetch(10, nil),
			ninthMove: received_array.fetch(11, nil)
		)

		# Respond back with a success message
		render json: { status: 'success', message: 'Array received', data: received_array }
	rescue => e
		render json: { status: 'error', message: e.message }
	end

	def get_value
		# TODO: implement
		test_value = "12345"
		render json: {	
			x_winrate: test_value,
			player_winrate: test_value,
			random_winrate: test_value,
			minmaxer_winrate: test_value,
			most_common_first: test_value
		}
	rescue => e
		render json: { status: 'error', message: e.message }
	end

end
