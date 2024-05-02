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
      ninthMove: received_array.fetch(11, nil),
    )

    # Respond back with a success message
    render json: { status: "success", message: "Array received", data: received_array }
  rescue => e
    render json: { status: "error", message: e.message }
  end

  def get_value
    builder = Nokogiri::XML::Builder.new do |xml|
      xml.data {
        xml.x {
          xml.winrate GamesPlayed.where(winner: "X").count / GamesPlayed.count.to_f * 100
          xml.tierate GamesPlayed.where(winner: "Tie").count / GamesPlayed.count.to_f * 100
        }
        xml.player {
          xml.winrate (GamesPlayed.where(winner: "X", x_author: "player").count +
                       GamesPlayed.where(winner: "O", o_author: "player").count) /
                        (GamesPlayed.where(x_author: "player").count +
                         GamesPlayed.where(o_author: "player").count.to_f) * 100
          xml.tierate (GamesPlayed.where(winner: "Tie", x_author: "player").count +
                       GamesPlayed.where(winner: "Tie", o_author: "player").count) /
                        (GamesPlayed.where(x_author: "player").count +
                         GamesPlayed.where(o_author: "player").count.to_f) * 100
        }
        xml.random {
          xml.winrate (GamesPlayed.where(winner: "X", x_author: "random").count +
                       GamesPlayed.where(winner: "O", o_author: "random").count) /
                        (GamesPlayed.where(x_author: "random").count +
                         GamesPlayed.where(o_author: "random").count.to_f) * 100
          xml.tierate (GamesPlayed.where(winner: "Tie", x_author: "random").count +
                       GamesPlayed.where(winner: "Tie", o_author: "random").count) /
                        (GamesPlayed.where(x_author: "random").count +
                         GamesPlayed.where(o_author: "random").count.to_f) * 100
        }
        xml.minmaxer {
          xml.winrate (GamesPlayed.where(winner: "X", x_author: "minmaxer").count +
                       GamesPlayed.where(winner: "O", o_author: "minmaxer").count) /
                        (GamesPlayed.where(x_author: "minmaxer").count +
                         GamesPlayed.where(o_author: "minmaxer").count.to_f) * 100
          xml.tierate (GamesPlayed.where(winner: "Tie", x_author: "minmaxer").count +
                       GamesPlayed.where(winner: "Tie", o_author: "minmaxer").count) /
                        (GamesPlayed.where(x_author: "minmaxer").count +
                         GamesPlayed.where(o_author: "minmaxer").count.to_f) * 100
        }
      }
    end

    render xml: builder.to_xml
  rescue => e
    builder = Nokogiri::XML::Builder.new do |xml|
      xml.data {
        xml.status "Error"
        xml.message e.message
      }
    end
    render render xml: builder.to_xml
  end
end
