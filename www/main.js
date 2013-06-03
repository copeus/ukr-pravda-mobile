$(document).ready(function() {
	
	initInterface();
	
	function initInterface(){

		if (typeof navigator.network != "undefined" && navigator.network.connection.type == Connection.NONE) {
			navigator.notification.alert('Будь ласка, перевiрте, чи доступно пiдключення до Internet!');
		} 

		if ((typeof device != "undefined" && device.platform != 'Andriod') || (typeof device == "undefined" )){
			$("#close-button").hide();
		}
		
		$( "div[data-role='header']:empty" ).html(		
			$( "#header-tmpl" ).render()
		).trigger( "create" );
	};		
		

	applyLocalSettings();	
	/* 
	 * applyLocalSettings running on start and restore user settings from localDB
	 */
	function applyLocalSettings() {
		$.settings = [];
		
		$.settings.font_size = window.localStorage.getItem("font-size");
		$.settings.font_size = (typeof $.settings.font_size  !="undefined") ? $.settings.font_size : 13;
		$("body").css('font-size',$.settings.font_size+'px');
		
		$.settings.update_period = window.localStorage.getItem("update-period");
		$.settings.update_period = (typeof $.settings.update_period  !="undefined") ? $.settings.update_period : 5;
		window.localStorage.setItem("update-period", $.settings.update_period);

		$("div#settingspage").on("pagebeforeshow", function(event) {
	    	$( "#settingspage #font-size").val($.settings.font_size).slider("refresh");
	    	$( "#settingspage #update-period").val($.settings.update_period).slider("refresh");
		});		


	}	
	/*
	 * Universal class, that return ask for RSS and render block  
	 */	
	function RSS_viewer (url_rss, selector_html_block, selector_item_for_render, selector_click_item, onRender) {
    	
    	this.url_rss = url_rss;
    	this.selector_html_block = selector_html_block;
    	this.selector_item_for_render = selector_item_for_render;
    	this.selector_click_item = selector_click_item;
    	this.onRender = onRender || function() {};
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
			
			$.mobile.loading( 'hide' );
			
			this.onRender();	
			
    	}

    	this.getData = function() {
    		$.mobile.loading( 'show', {text: 'завантаження ...'} );	
			$.ajax({
				dataType: "json",
				url: this.url_rss,
				success: this.processData,
				context: this,
				timeout: 10000,
				fail: function() {if (typeof navigator.notification != "undefined") navigator.notification.alert('Новини не завантажились. Будь ласка, перевiрте, чи доступно пiдключення до Internet та натисните [Обновити]!');}
				 
			}); 
		}
		
		this.processData = function(data) {
			this.data_items = data.value.items[0].channel.item;
			if (this.data_items.length == 0)
			{
				if (typeof navigator.notification != "undefined") navigator.notification.alert('Новини не завантажились. Будь ласка, перевiрте, чи доступно пiдключення до Internet та натисните [Обновити]!')
			}
			
			$.each(this.data_items, function(key, val) {
				pubDate = new Date(val.pubDate);

				val.pubTime = (pubDate.getHours() <=9 ?  '0'+pubDate.getHours(): pubDate.getHours() ) + ':'+   (pubDate.getMinutes() <=9 ?  '0'+pubDate.getMinutes(): pubDate.getMinutes() );
				m = pubDate.getMonth() +1;
				val.displayDate = (pubDate.getDate() <=9 ?  '0'+pubDate.getDate(): pubDate.getDate() ) + '.'+   (m <=9 ?  '0'+m: m )+'.'+pubDate.getFullYear(); 
				val.pubTimeDate = (pubDate.getDate() <=9 ?  '0'+pubDate.getDate(): pubDate.getDate() ) + '.'+   (m <=9 ?  '0'+m: m )+ ' ' + val.pubTime
			
				var author_regex = /\(.*\)/ig;			
				val.displayAuhtor = (typeof val.fulltext !="undefined") ? author_regex.exec(val.author) : 'Українська правда';
				
				val.description = (val.description== null) ? ((typeof val.fulltext !="undefined") ? val.fulltext.slice(0, 100) + '...': val.title) : val.description;
			
				val.fulltext = (typeof val.fulltext !="undefined") ? '<p>' + val.fulltext.replace(/<\/?[^>]+>/gi, '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '</p><p>' + '$2')+ '</p>' : val.description;
				val.fulltext = ( val.fulltext == null)? val.description : val.fulltext.replace("<p></p>", '','g') ;
				
			});
						
			this.renderHTML();
		}
		
		//this.getData();
		
	}

	
	var js2jsp_service = "http://pipes.yahoo.com/pipes/pipe.run?_id=4d625dfe6977e71acb45db4aa51726a6&_render=json&feedurl=";
	
	$.items_containters  = {
		"#newspage" : new RSS_viewer(js2jsp_service+"http://www.pravda.com.ua/rss/view_news/","#newspage dl.news-title", "#news-title-items" , "#newspage dl.news-title dd" ),
		"#mainpage" : new RSS_viewer(js2jsp_service+"http://www.pravda.com.ua/rss/view_mainnews/","#mainpage dl.news-title", "#news-title-items" , "#mainpage dl.news-title dd" ),
		"#articlespage" : new RSS_viewer(js2jsp_service+"http://www.pravda.com.ua/rss/view_pubs/","#articlespage div.articles", "#article-title-items" , "div.article-title", onArticleRender ) ,
		"#blogspage" : new RSS_viewer(js2jsp_service+"http://blogs.pravda.com.ua/rss/","#blogspage div.blogs", "#blog-title-items" , "div.blog-title", onBlogsRender) ,
		"#economicspage" :  [
						new RSS_viewer(js2jsp_service+"http://www.epravda.com.ua/rss/id_434/","#economicspage dl.news-title", "#mainpage #news-title-items" , "#economicspage dl.news-title dd" ),
						new RSS_viewer(js2jsp_service+"http://www.epravda.com.ua/rss/id_433/","#economicspage div.articles", "#articlespage #article-title-items" , "#economicspage div.article-title" ) ,
							],
		"#tabloidpage" :  new RSS_viewer(js2jsp_service+"http://tabloid.pravda.com.ua/rss/","#tabloidpage dl.news-title", "#mainpage #news-title-items" , "#tabloidpage dl.news-title dd" ),
		"#lifepage" :  new RSS_viewer(js2jsp_service+"http://tabloid.pravda.com.ua/rss/","#lifepage dl.news-title", "#mainpage #news-title-items" , "#lifepage dl.news-title dd" ),
		"#sportpage" :  [
						new RSS_viewer(js2jsp_service+"http://www.champion.com.ua/rss/view_news/","#sportpage dl.news-title", "#mainpage #news-title-items" , "#sportpage dl.news-title dd" ),
						new RSS_viewer(js2jsp_service+"http://www.champion.com.ua/rss/view_pubs/","#sportpage div.articles", "#articlespage #article-title-items" , "#sportpage div.article-title" ) ,
							],
	
						
		
	};
	
	function onArticleRender(){
		$('#articlespage div.articles div.article-title').slice(0,4).clone(true).appendTo('#mainpage div.articles');
	}
	
	function onBlogsRender(){
		//$('#blogspage div.blogs div.blog-title').slice(0,2).clone(true).appendTo('#mainpage div.blogs');
	}
	
	
//	$.items_containters["#mainpage"].getData();
//	$.items_containters["#articlespage"].getData();
	if (window.location.hash != "")
		loadData(window.location.hash);
	else {
		loadData("#mainpage");
		loadData("#articlespage");
	}
	
	/* 
	 * Gets and shows Data from RSS for current_page_id
	 */ 
	function loadData(current_page_id)
	{
		if ($.isArray($.items_containters[current_page_id]))
				$.each($.items_containters[current_page_id], function() {this.getData()} )
			else
		$.items_containters[current_page_id].getData()	
		
	}
		
		
	$('div[data-role=page]').on('pagebeforeshow',function(event, ui)
	{
		if( typeof $.items_containters["#"+event.target.id] == "undefined") return;
		
		lastupdate = (typeof $(this).data('lastupdate') != "undefined") ? $(this).data('lastupdate') : 0;
		
		if($("#"+event.target.id+"  #news-title-items").size()==0 && $("#"+event.target.id+" dl.news-title dd").size()==0 && $("#"+event.target.id+" div.blog-title").size()==0 )
			lastupdate = 0;
		
    	if (  ($.now() - lastupdate) > $.settings.update_period*60*1000 )
    	{
    		$(this).data('lastupdate', $.now());
    		loadData("#"+event.target.id);
    	}

	});	

	
    
	/*
	 * Settings page font slider
	 */
	$( "#settingspage").on('change','#font-size',function (event) {
			$("#settingspage p:first").css('font-size',$(this).val()+'px' )
	});
	
			
	/*
	 * Save settings page font function
	 */
	$( "#settingspage .back-button").click(function () {

			$.settings.font_size = $( "#settingspage #font-size").val();
			window.localStorage.setItem("font-size", $( "#settingspage #font-size").val());

			$.settings.update_period =  $( "#settingspage #update-period").val();
			window.localStorage.setItem("update-period",$.settings.update_period);

			applyLocalSettings();
	});
	
	$("a[href='#refresh']").click(function() {	
		window.location.reload();
	});
	
	$("#close-button").click(function() {
		
		navigator.notification.confirm(
        	'Ви бажаете закрити Українська правду?',  // message
        	function(button) {if (button == "Вихiд") device.exitApp(); },              // callback to invoke with index of button pressed
        	'Закрити',            // title
        	'Вiдмiна,Вихiд'          // buttonLabels
    	);
	});


});