require 'sinatra'
require 'haml'

get '/' do
  redirect 'game'
end

get '/game/?' do
  Person = Struct.new(:name,:avatar,:balance)
  @person = Person.new("nilabar","avatar_4.jpg",1200000)
  haml :game
end

get '/game/ajax/panel' do
  puts params['cmd']
  case params['cmd']
    when 'help'
      haml :game_help, layout: nil
    when 'dashboard'
      haml :game_dashboard, layout: nil
    when 'economy'
      haml :game_economy, layout: nil
    else
      status 200  
  end

end