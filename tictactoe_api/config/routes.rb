Rails.application.routes.draw do
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  namespace :api do
	post 'data/save', to: 'data#save'
	get 'data/get_value', to: 'data#get_value'
	end

end