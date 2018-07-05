require 'sinatra'
require 'haml'

get '/' do
  @nickname = "nilabar"
  redirect 'game'
end

get '/game/?' do
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