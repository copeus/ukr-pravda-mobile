$(document).ready(function() {
	
	
	var url_news = "http://pipes.yahoo.com/pipes/pipe.run?_id=4d625dfe6977e71acb45db4aa51726a6&_render=json&feedurl=http://www.pravda.com.ua/rss/view_news/";
	var url_mainnews = "http://pipes.yahoo.com/pipes/pipe.run?_id=4d625dfe6977e71acb45db4aa51726a6&_render=json&feedurl=http://www.pravda.com.ua/rss/view_mainnews/";
	var url_articles = "http://pipes.yahoo.com/pipes/pipe.run?_id=4d625dfe6977e71acb45db4aa51726a6&_render=json&feedurl=http://www.pravda.com.ua/rss/view_pubs/";
	var url_blogs = "http://pipes.yahoo.com/pipes/pipe.run?_id=4d625dfe6977e71acb45db4aa51726a6&_render=json&feedurl=http://blogs.pravda.com.ua/rss/";
	
	
	$.mobile.loading( 'show' );
	
	$("#refreshbtn").click(function() {
		/*
		 jQuery.mobile.changePage(window.location.href, {
        	allowSamePageTransition: true,
        	transition: 'none',
        	reloadPage: true
    	});
    	* 
		 */
		window.location.reload()
	});
	
	
	function applyLocalSettings() {
		var font_size = window.localStorage.getItem("font-size");
		font_size = (typeof font_size  !="undefined") ? font_size : 13;
		$("body").css('font-size',font_size+'px');
		$( "#settingspage #font-size").val(font_size);
	}
    
	applyLocalSettings();
	
	/*
	 * Get and process data for news 
	 */
	$.getJSON(url_news, function(data) {
		
		$.data_news = data.value.items[0].channel.item;
		$.each($.data_news, function(key, val) {
			pubDate = new Date(val.pubDate);
			$.data_news[key].pubTime = (pubDate.getHours() <=9 ?  '0'+pubDate.getHours(): pubDate.getHours() ) + ':'+   (pubDate.getMinutes() <=9 ?  '0'+pubDate.getMinutes(): pubDate.getMinutes() );
			val.fulltext = (typeof val.fulltext !="undefined") ? '<p>' + val.fulltext.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '</p><p>' + '$2')+ '</p>' : val.description;
			val.fulltext = ( val.fulltext == null)? val.description : val.fulltext.replace("<p></p>", '','g') ;
		});
		
		$( "#newspage dl.news-title" ).html(
			$( "#news-title-items" ).render( $.data_news )
		);
		
		/*
	 	* News page news item click  
		 */
	
		$( "#newspage dl.news-title dd" ).bind('click', function(){
				anchor = $(this).is("a") ? $(this) : $(this).find("a");
				$.curr_key = /#news\-(\d+)/g.exec(anchor.attr('href'))[1] ;
				$( "#textpage #content" ).html(		
					$( "#news-full-item" ).render( $.data_news[$.curr_key] )
				);
				$.mobile.changePage( $("#textpage"), { transition: "turn"} );	
		});
		
		$.mobile.loading( 'hide' );
	});

	/*
	 * Get and process data for main news 
	 */
	$.getJSON(url_mainnews, function(data) {
		
		$.data_mainnews = data.value.items[0].channel.item;
		
		$.each($.data_mainnews, function(key, val) {
			pubDate = new Date(val.pubDate);
			$.data_mainnews[key].pubTime = (pubDate.getHours() <=9 ?  '0'+pubDate.getHours(): pubDate.getHours() ) + ':'+   (pubDate.getMinutes() <=9 ?  '0'+pubDate.getMinutes(): pubDate.getMinutes() );
			val.fulltext = (typeof val.fulltext !="undefined") ? '<p>' + val.fulltext.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '</p><p>' + '$2')+ '</p>' : val.description;
			val.fulltext = ( val.fulltext == null)? val.description : val.fulltext.replace("<p></p>", '','g') ;
		});
		
		$( "#mainpage dl.news-title" ).html(
			$( "#news-title-items" ).render( $.data_mainnews )
		);
		
		/*
	 	* Main page news item click  
		 */
	
		$( "#mainpage dl.news-title dd" ).bind('click', function(){
				anchor = $(this).is("a") ? $(this) : $(this).find("a");
				$.curr_key = /#news\-(\d+)/g.exec(anchor.attr('href'))[1] ;
				$( "#textpage #content" ).html(		
					$( "#news-full-item" ).render( $.data_mainnews[$.curr_key] )
				);
				$.mobile.changePage( $("#textpage"), { transition: "turn"} );	
		});
	
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

			val.fulltext = (typeof val.fulltext !="undefined") ? '<p>' + val.fulltext.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '</p><p>' + '$2')+ '</p>' : val.description;
			val.fulltext = ( val.fulltext == null)? val.description : val.fulltext.replace("<p></p>", '','g') ;

		});
		
		
		$( "#mainpage div.articles" ).html(
			$( "#article-title-items" ).render( $.data_articles.slice(0,4) )
		);
		
		$( "#articlespage div.articles" ).html(
			$( "#article-title-items" ).render( $.data_articles )
		);
		
		/*
	 	* Main page and aricles page article item click  
	 	*/
	
		$( "div.article-title" ).bind('click',function(){
				anchor = $(this).is("a") ? $(this) : $(this).find("a");
				$.curr_key = /#article\-(\d+)/g.exec(anchor.attr('href'))[1] ;
				$( "#textpage #content" ).html(		
					$( "#article-full-item" ).render( $.data_articles[$.curr_key] )
				);
				$.mobile.changePage( $("#textpage"), { transition: "turn"} );	
		});
	
	});
	
	/*
	 * Get and process data for blogs 
	 */	
	$.getJSON(url_blogs, function(data) {
		
		$.data_blogs = data.value.items[0].channel.item;
		
		$.each($.data_blogs, function(key, val) {
			pubDate = new Date(val.pubDate);
			m = pubDate.getMonth() +1;
			$.data_blogs[key].displayDate = (pubDate.getDay() <=9 ?  '0'+pubDate.getDay(): pubDate.getDay() ) + '.'+   (m <=9 ?  '0'+m: m )+'.'+pubDate.getFullYear(); 
			
			var author_regex = /\(.*\)/ig;			
			$.data_blogs[key].displayAuhtor = author_regex.exec(val.author);

			val.description = (val.description== null) ? val.fulltext.slice(0, 100) + '...' : val.description;
			
			val.fulltext = (typeof val.fulltext !="undefined") ? '<p>' + val.fulltext.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '</p><p>' + '$2')+ '</p>' : val.description;
			val.fulltext = ( val.fulltext == null)? val.description : val.fulltext.replace("<p></p>", '','g') ;
			
			

		});
		
		$( "#blogspage div.blogs" ).html(
			$( "#blog-title-items" ).render( $.data_blogs )
		);
		
			
		/*
		 * Blogs page item click  
		 */
	
		$( "div.blog-title" ).bind('click', function(){
				anchor = $(this).is("a") ? $(this) : $(this).find("a");
				$.curr_key = /#blog\-(\d+)/g.exec(anchor.attr('href'))[1] ;
				$( "#textpage #content" ).html(		
					$( "#blog-full-item" ).render( $.data_blogs[$.curr_key] )
				);
				$.mobile.changePage( $("#textpage"), { transition: "turn"} );	
		});
		
		
	});	

	


	

	
	/*
	 * Settings page font slider
	 */

	$( "#settingspage #font-size").on('change',function (event) {
			$("#settingspage p:first").css('font-size',$(this).val()+'px' )
	});	
	/*
	 * Save settings function
	 */
	
	$( "#settingspage .back-button").click(function () {
			window.localStorage.setItem("font-size", $( "#settingspage #font-size").val());
			applyLocalSettings();
	});
	


});