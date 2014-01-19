$(document).ready(function() {
	
	initInterface();
	
	function initInterface(){

		if (typeof navigator.network != "undefined" && navigator.network.connection.type == Connection.NONE) {
			navigator.notification.alert('Будь ласка, перевiрте, чи доступно пiдключення до Internet!');
		} 

		//if ((typeof device != "undefined" && device.platform != 'Andriod') || (typeof device == "undefined" )){
		//	$("#close-button").hide();
		//}
		
		$( "div[data-role='header']:empty" ).html(		
			$( "#header-tmpl" ).render()
		).trigger( "create" );
		
		$(document).on({
		  ajaxStart: function() { 
			setTimeout(function(){
			       	$.mobile.loading( 'show', {text: 'завантаження ...'} );	
			    }, 1); 
		  },
		  ajaxStop: function() {
			setTimeout(function(){
			        $.mobile.loading('hide');
			    }, 1); 
		 },
		  ajaxError: function() {
			setTimeout(function(){
			        $.mobile.loading('hide');
			    }, 1); 
		  }    
		});
		
		document.addEventListener("backbutton", function() {
            /*if ( $('.ui-page-active').attr('id') == 'main') {
                exitAppPopup();
            } else {
                history.back();             
            }*/
           	navigator.app.exitApp();
            //exitAppPopup();
        }, false);
        
		function exitAppPopup() {
		    navigator.notification.confirm(
		          'Exit PhoneGap ' + device.cordova + ' Demo?'
		        , function(button) {
		              if (button == 2) {
		                  navigator.app.exitApp();
		              } 
		          }
		        , 'Exit'
		        , 'No,Yes'
		    );  
		    return false;
		}   
	};		
		

	applyLocalSettings();	
	/* 
	 * applyLocalSettings running on start and restore user settings from localDB
	 */
	function applyLocalSettings() {
		$.settings = [];
		
		$.settings.font_size = window.localStorage.getItem("font-size");
		$.settings.font_size = (typeof $.settings.font_size  !="undefined" && $.settings.font_size == null) ? $.settings.font_size : 13;
		$("body").css('font-size',$.settings.font_size+'px');

		$.settings.update_period = window.localStorage.getItem("update-period");
		$.settings.update_period = (typeof $.settings.update_period  !="undefined" && $.settings.update_period == null) ? $.settings.update_period : 5;
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
    	
    	this.js2jsp_service = "https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&output=xml&q=";
    	
    	this.url_rss = url_rss;
    	this.selector_html_block = selector_html_block;
    	this.selector_item_for_render = selector_item_for_render;
    	this.selector_click_item = selector_click_item;
    	this.onRender = onRender || function() {};
    	this.data_items = [];
    	
    	this.url_domain = this.url_rss.match(/(.[^/]+)/)[1];
    	//console.log(this.url_domain);
    	    	
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

			$.ajax({
				dataType: "jsonp",
				url: this.js2jsp_service + "http://"+this.url_rss,
				success: this.processData,
				context: this,
				timeout: 15000,
				fail: function() {if (typeof navigator.notification != "undefined") navigator.notification.alert('Новини не завантажились. Будь ласка, перевiрте, чи доступно пiдключення до Internet та натисните [Обновити]!');}
				 
			}); 
		}
		
		this.processData = function(data) {
	/*
			this.data_items = data.responseData.feed.entries;
			if (this.data_items.length == 0)
			{
				if (typeof navigator.notification != "undefined") navigator.notification.alert('Новини не завантажились. Будь ласка, перевiрте, чи доступно пiдключення до Internet та натисните [Обновити]!')
			}
			
	*/		
			var data_items = []
			var xmlData = $(data.responseData.xmlString); 
			var url_domain = this.url_domain;
			
			switch(url_domain) {
			  case 'www.epravda.com.ua': {
			    url_img_domain = 'eimg.pravda.com.ua'
			    break;
			  }
			  default: {
			    url_img_domain = 'img.pravda.com.ua'
			  }
			}
			

			$.each(xmlData.find('item'), function(key, val) {
				data_items[key] = {}
				data_items[key].title = $(val).find("title").text()

				pubDate = new Date($(val).find("pubdate").text());

				data_items[key].pubDate = pubDate; 

				data_items[key].pubTime = (pubDate.getHours() <=9 ?  '0'+pubDate.getHours(): pubDate.getHours() ) + ':'+   (pubDate.getMinutes() <=9 ?  '0'+pubDate.getMinutes(): pubDate.getMinutes() );
				m = pubDate.getMonth() +1;
				data_items[key].displayDate = (pubDate.getDate() <=9 ?  '0'+pubDate.getDate(): pubDate.getDate() ) + '.'+   (m <=9 ?  '0'+m: m )+'.'+pubDate.getFullYear(); 
				data_items[key].pubTimeDate = (pubDate.getDate() <=9 ?  '0'+pubDate.getDate(): pubDate.getDate() ) + '.'+   (m <=9 ?  '0'+m: m )+ ' ' + data_items[key].pubTime
			
				var author_regex = /\(.*\)/ig;			
				data_items[key].displayAuhtor = ($(val).find("author").size()>0) ? author_regex.exec($(val).find("author").text()) : 'Українська правда';
				
				data_items[key].description = ($(val).find("description").size()>0) ? $(val).find("description").text() : ((typeof data_items[key].fulltext !="undefined") ? data_items[key].fulltext.slice(0, 100) + '...': data_items[key].title);

				if ($(val).find("fulltext").size()>0)
				{
					data_items[key].fulltext = $(val).find("fulltext").text().replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '</p><p>' + '$2')
					data_items[key].fulltext = strip_tags(data_items[key].fulltext,'<p><a><strong><em><img>')
					fulltext = $("<div>").html(data_items[key].fulltext)
					fulltext.find("a[href^='/']").each(function() {$(this).attr("href", "http://"+ url_domain + $(this).attr("href")  )})
					fulltext.find("img").each(function() {
						//if ( $(this).parent().is( "a" ) ) {$(this).unwrap();}
						$(this).attr("src", "http://"+ url_img_domain + $(this).attr("src")  ).attr("width","240").removeAttr("height").wrap( "<p class='articleimg'></p>" ); 
						
					})
					data_items[key].fulltext = fulltext.html();
					
					
					//$("body").html(fulltext.html())
					//data_items[key].fulltext = fulltext.html();
					//$(data_items[key].fulltext).find("a").each(function() {$(this).removeAttr("height").attr("width","200")})
					//data_items[key].fulltext = .html(); 
				}
				else 
					data_items[key].fulltext = data_items[key].description;
					
				data_items[key].fulltext = ( data_items[key].fulltext == null)? data_items[key].description : data_items[key].fulltext.replace("<p></p>", '','g') ;
				
				data_items[key].enclosure = ($(val).find("enclosure").size()>0)  ? {url : $(val).find("enclosure").attr("url") } : null
				
			});
			this.data_items = data_items;
					
			this.renderHTML();
		}
		
		//this.getData();
		
	}

	function strip_tags (input, allowed) {
	  allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
	  var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
	    commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
	  return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
	    return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
	  });
	}

	
	
	
	$.items_containters  = {
		"#newspage" : new RSS_viewer("www.pravda.com.ua/rss/view_news/","#newspage dl.news-title", "#news-title-items" , "#newspage dl.news-title dd" ),
		"#mainpage" : new RSS_viewer("www.pravda.com.ua/rss/view_mainnews/","#mainpage dl.news-title", "#news-title-items" , "#mainpage dl.news-title dd" ),
		"#articlespage" : new RSS_viewer("www.pravda.com.ua/rss/view_pubs/","#articlespage div.articles", "#article-title-items" , "div.article-title", onArticleRender ) ,
		"#blogspage" : new RSS_viewer("blogs.pravda.com.ua/rss/","#blogspage div.blogs", "#blog-title-items" , "div.blog-title", onBlogsRender) ,
		"#economicspage" :  [
						new RSS_viewer("www.epravda.com.ua/rss/id_434/","#economicspage dl.news-title", "#mainpage #news-title-items" , "#economicspage dl.news-title dd" ),
						new RSS_viewer("www.epravda.com.ua/rss/id_433/","#economicspage div.articles", "#articlespage #article-title-items" , "#economicspage div.article-title" ) ,
							],
		"#tabloidpage" :  new RSS_viewer("tabloid.pravda.com.ua/rss/","#tabloidpage dl.news-title", "#mainpage #news-title-items" , "#tabloidpage dl.news-title dd" ),
		"#lifepage" :  new RSS_viewer("tabloid.pravda.com.ua/rss/","#lifepage dl.news-title", "#mainpage #news-title-items" , "#lifepage dl.news-title dd" ),
		"#sportpage" :  [
						new RSS_viewer("www.champion.com.ua/rss/view_news/","#sportpage dl.news-title", "#mainpage #news-title-items" , "#sportpage dl.news-title dd" ),
						new RSS_viewer("www.champion.com.ua/rss/view_pubs/","#sportpage div.articles", "#articlespage #article-title-items" , "#sportpage div.article-title" ) ,
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
		/*
		navigator.notification.confirm(
        	'Ви бажаете закрити Українська правду?',  // message
        	function(button) {if (button == "Вихiд") device.exitApp(); },              // callback to invoke with index of button pressed
        	'Закрити',            // title
        	'Вiдмiна,Вихiд'          // buttonLabels
    	);
    	*/
    	navigator.app.exitApp();
    	device.exitApp();
	});


});