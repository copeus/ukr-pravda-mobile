$(document).ready(function() {
	
	initInterface();
	applyLocalSettings();
	
	
	function initInterface(){
		$( "div[data-role='header']" ).html(		
			$( "#header-tmpl" ).render()
		).trigger( "create" );
		
		$("div[data-role=header].withbar").after(		
			$( "#navbar-tmpl" ).render()
		);
		
		$( "div[data-role='navbar']").navbar();
		

		$("div[data-role='navbar'] a").each(function(){
			//console.log($(this).attr('href'), "#"+$(this).parents("div[data-role='page']").attr('id'))
			if($(this).attr('href') == ("#"+$(this).parents("div[data-role='page']").attr('id')) )
				$(this).addClass("ui-btn-active ui-state-persist")
		})
	};
	
	/*
	 * Universal class, that return ask for RSS and render block  
	 */	
	function RSS_viewer (url_rss, selector_html_block, selector_item_for_render, selector_click_item, onRender = function() {} ) {
    	
    	this.url_rss = url_rss;
    	this.selector_html_block = selector_html_block;
    	this.selector_item_for_render = selector_item_for_render;
    	this.selector_click_item = selector_click_item;
    	this.onRender = onRender;
    	this.data_items = [];
    	
    	    	
    	this.renderHTML = function(){
    		$( this.selector_html_block).html(
				$(this.selector_item_for_render).render( this.data_items )
			);
			/*
	 		* Bind item click  
		 	*/
	
			$( this.selector_click_item ).bind('click',{data_items: this.data_items}, function(event){
				anchor = $(this).is("a") ? $(this) : $(this).find("a");
				curr_key = /#item\-(\d+)/g.exec(anchor.attr('href'))[1] ;
				$.curr_item = event.data.data_items[curr_key]; 
				$( "#textpage #content" ).html(		
					$( "#news-full-item" ).render( $.curr_item )
				);
				$.mobile.changePage( $("#textpage"), { transition: "turn"} );	
			});
			
			this.onRender();	
			
    	}

    	this.getData = function() {
    		$.mobile.loading( 'show' );	
			$.ajax({
				dataType: "json",
				url: this.url_rss,
				success: this.processData,
				context: this
			}); 
		}
		
		this.processData = function(data) {
			this.data_items = data.value.items[0].channel.item;
			$.each(this.data_items, function(key, val) {
				pubDate = new Date(val.pubDate);
				val.pubTime = (pubDate.getHours() <=9 ?  '0'+pubDate.getHours(): pubDate.getHours() ) + ':'+   (pubDate.getMinutes() <=9 ?  '0'+pubDate.getMinutes(): pubDate.getMinutes() );
				m = pubDate.getMonth() +1;
				val.displayDate = (pubDate.getDay() <=9 ?  '0'+pubDate.getDay(): pubDate.getDay() ) + '.'+   (m <=9 ?  '0'+m: m )+'.'+pubDate.getFullYear(); 
				val.pubTimeDate = (pubDate.getDay() <=9 ?  '0'+pubDate.getDay(): pubDate.getDay() ) + '.'+   (m <=9 ?  '0'+m: m )+ ' ' + val.pubTime
			
				var author_regex = /\(.*\)/ig;			
				val.displayAuhtor = (typeof val.fulltext !="undefined") ? author_regex.exec(val.author) : 'Українська правда';
				
				val.description = (val.description== null) ? ((typeof val.fulltext !="undefined") ? val.fulltext.slice(0, 100) + '...': val.title) : val.description;
			
				val.fulltext = (typeof val.fulltext !="undefined") ? '<p>' + val.fulltext.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '</p><p>' + '$2')+ '</p>' : val.description;
				val.fulltext = ( val.fulltext == null)? val.description : val.fulltext.replace("<p></p>", '','g') ;
			});
			
			$.mobile.loading( 'hide' );
			
			this.renderHTML();
		}
		
		this.getData();
		
	}

	
	var js2jsp_service = "http://pipes.yahoo.com/pipes/pipe.run?_id=4d625dfe6977e71acb45db4aa51726a6&_render=json&feedurl=";
	
	var items_containters  = [
		new RSS_viewer(js2jsp_service+"http://www.pravda.com.ua/rss/view_news/","#newspage dl.news-title", "#news-title-items" , "#newspage dl.news-title dd" ),
		new RSS_viewer(js2jsp_service+"http://www.pravda.com.ua/rss/view_mainnews/","#mainpage dl.news-title", "#news-title-items" , "#mainpage dl.news-title dd" ),
		new RSS_viewer(js2jsp_service+"http://www.pravda.com.ua/rss/view_pubs/","#articlespage div.articles", "#article-title-items" , "div.article-title", onArticleRender ) ,
		new RSS_viewer(js2jsp_service+"http://blogs.pravda.com.ua/rss/","#blogspage div.blogs", "#blog-title-items" , "div.blog-title", onBlogsRender) ,
	];
	
	function onArticleRender(){
		$('#articlespage div.articles div.article-title').slice(0,4).clone(true).appendTo('#mainpage div.articles');
	}
	
	function onBlogsRender(){
		$('#blogspage div.blogs div.blog-title').slice(0,2).clone(true).appendTo('#mainpage div.blogs');
	}

	/*
	 * applyLocalSettings running on start and restore user settings from localDB
	 */
	function applyLocalSettings() {
		var font_size = window.localStorage.getItem("font-size");
		font_size = (typeof font_size  !="undefined") ? font_size : 13;
		$("body").css('font-size',font_size+'px');
		$( "#settingspage #font-size").val(font_size);
	}
    
	/*
	 * Settings page font slider
	 */
	$( "#settingspage").on('change','#font-size',function (event) {
			$("#settingspage p:first").css('font-size',$(this).val()+'px' )
	});
		
	/*
	 * Save settings function
	 */
	$( "#settingspage .back-button").click(function () {
			window.localStorage.setItem("font-size", $( "#settingspage #font-size").val());
			applyLocalSettings();
	});
	
	$("#refreshbtn").click(function() {
		/*
		 jQuery.mobile.changePage(window.location.href, {
        	allowSamePageTransition: true,
        	transition: 'none',
        	reloadPage: true
    	});
    	* 
		 */
		var url = $(this).attr('href');
		$.mobile.changePage( url, { reloadPage: true, transition: "none"} );
		//window.location.reload()
	});
	

});