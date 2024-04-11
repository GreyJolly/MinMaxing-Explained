class CreateGamesPlayeds < ActiveRecord::Migration[6.1]
  def change
    create_table :games_playeds do |t|
      t.string :x_author
      t.string :o_author
      t.string :winner
      t.integer :firstMove
      t.integer :secondMove
      t.integer :thirdMove
      t.integer :fourthMove
      t.integer :fifthMove
      t.integer :sixthMove
      t.integer :seventhMove
      t.integer :eigthMove
      t.integer :ninthMove
    end
  end
end
