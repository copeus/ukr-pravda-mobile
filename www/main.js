$(document).ready(function() {
	
	var url_news = "http://pipes.yahoo.com/pipes/pipe.run?_id=4d625dfe6977e71acb45db4aa51726a6&_render=json&feedurl=http://www.pravda.com.ua/rss/view_news/";
	var url_articles = "http://pipes.yahoo.com/pipes/pipe.run?_id=4d625dfe6977e71acb45db4aa51726a6&_render=json&feedurl=http://www.pravda.com.ua/rss/view_pubs/";
	//var url_blogs = "http://pipes.yahoo.com/pipes/pipe.run?_id=4d625dfe6977e71acb45db4aa51726a6&_render=json&feedurl=http://www.pravda.com.ua/rss/view_pubs/";
	
	/*
	 * Get and process data for news 
	 */
	$.getJSON(url_news, function(data) {
		
		$.data_news = data.value.items[0].channel.item;
		
		$.each($.data_news, function(key, val) {
			pubDate = new Date(val.pubDate);
			$.data_news[key].pubTime = (pubDate.getHours() <=9 ?  '0'+pubDate.getHours(): pubDate.getHours() ) + ':'+   (pubDate.getMinutes() <=9 ?  '0'+pubDate.getMinutes(): pubDate.getMinutes() );
		});
		
		$( "dl.news-title" ).html(
			$( "#news-title-items" ).render( $.data_news )
		);
	});

	/*
	 * Get and process data for articles 
	 */	
	$.getJSON(url_articles, function(data) {
		
		$.data_articles = data.value.items[0].channel.item;
		
		
				
		$.each($.data_articles, function(key, val) {
			pubDate = new Date(val.pubDate);
			m = pubDate.getMonth() +1;
			$.data_articles[key].displayDate = (pubDate.getDay() <=9 ?  '0'+pubDate.getDay(): pubDate.getDay() ) + '.'+   (m <=9 ?  '0'+m: m )+'.'+pubDate.getFullYear(); 
			
			var author_regex = /\(.*\)/ig;			
			$.data_articles[key].displayAuhtor = author_regex.exec(val.author);
			 	
		});
		
		
		$( "div.articles" ).html(
			$( "#article-title-items" ).render( $.data_articles.slice(0,2) )
		);
	});
	

});