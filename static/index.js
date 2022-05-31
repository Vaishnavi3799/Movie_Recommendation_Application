let $ = jQuery;
let url = "http://localhost:5000/";

let movie_table_headers = ["MovieID", "Title", "Duration", "IMDB ID", "CensorRating", "Popularity", "TagLine"];
let current_offset = 0;
let crnt_fun;

function display_movie_details(header, data){
    let $movie_details = $("#render-movie-details");
    $movie_details.empty();

    if(data.length == 0){
        $movie_details.html("<div class='movie-heading'>No Movies found</div>");
        return;
    }

    let $movie_table = $("<table class='movie_details_table'></table>");
    let $header_row = $("<tr class='movie-row movie-header-row'></tr>");
    let imdb_col = -1;

    for(let i = 0; i < header.length; i++){
        $header_row.append($("<th class='movie-col'>"+ header[i] +"</th>"));
        if(header[i] == "IMDB ID"){
            imdb_col = i;
        }

    }
    $movie_table.append($header_row);

    for(let i = 0; i < data.length; i++){
        let $data_row = $("<tr class='movie-row'></tr>");
        for(let j = 0; j < data[i].length; j++){
            if(j == imdb_col){
                $data_row.append($("<td class='movie-col'><a target='_blank' href='https://www.imdb.com/title/"+data[i][j]+"/'>" + data[i][j] + "</a></td>"));
            }
            else {
                $data_row.append($("<td class='movie-col'>"+ data[i][j] +"</td>"));
            }
        }
        $movie_table.append($data_row);
    }

    $movie_details.html($movie_table);
    $movie_details.prepend("<div class='movie-heading'>Movie Details</div>");
}

function bindEvents(){
    $("#movie-by-title").click(function (){
        $("#next-button-div").addClass("hidden");
        getMovie('title', $("#get-title").val());
    });

    $("#movie-by-id").click(function (){
        $("#next-button-div").addClass("hidden")
        getMovie('movieid', $("#get-id").val());
    });

    $("#movie-top-popular").click(function (){
        $("#next-button-div").addClass("hidden")
        getTopMovies("get_top_popular");
    });

    $("#movie-top-rated").click(function (){
        $("#next-button-div").addClass("hidden")
        getTopMovies("get_top_rated");
    });

    $("#all-movies").click(function (){
        current_offset = 0;
        crnt_fun = getAllMovie;
        getAllMovie();
    });

    $("#all-movies-by-genre").click(function (){
        current_offset = 0;
        crnt_fun = getAllMovieByGenre;
        getAllMovieByGenre();
    });

    $("#all-movies-by-production").click(function (){
        current_offset = 0;
        crnt_fun = getAllMovieByProduction;
        getAllMovieByProduction();
    });

    $("#all-movies-by-keyword").click(function (){
        current_offset = 0;
        crnt_fun = getAllMovieByKeyword;
        getAllMovieByKeyword();
    });

    $("#prev-button").click(function (){
        current_offset = current_offset == 0 ? current_offset : current_offset - 10;
        crnt_fun();
    });

    $("#next-button").click(function (){
        current_offset += 10;
        crnt_fun();
    });

    $("#login-page-button").click(function (){
        show_login();
    });

    $("#login-button").click(function (){
        check_login();
    });

    $("#admin-select-table select").change(function (){
        $(this).siblings().val("default");
        $("#admin-table").removeClass("hidden");
        $("#admin-table").empty();
        if($(this).attr('operation') == 'insert'){
            showInsertTable($(this).val());
        }
        else if($(this).attr('operation') == 'update'){
            showUpdateTable($(this).val());
        }
        else if($(this).attr('operation') == 'delete'){
            showDeleteTable($(this).val());
        }
    });

    $("#logout-button").click(function (){
        $(this).addClass('hidden');
        location.reload();
    });
}

function get_table_cols(table_name){
    if(table_name == 'Movie'){
        return [{"name" : "MovieID", "primary_key" : true, "mandatory" : true}, {"name" :"Title", "primary_key" : false, "mandatory" : true}, {"name" : "Duration", "primary_key" : false, "mandatory" : false}, {"name" : "IMDBID" , "primary_key" : false, "mandatory" : false}, {"name" : "CensorRating", "primary_key" : false, "mandatory" : false}, {"name" : "Popularity",  "primary_key" : false, "mandatory" : false}, {"name" : "TagLine",  "primary_key" : false, "mandatory" : false}];
    }
    else if(table_name == 'MovieRating'){
        return [{"name" : "MovieID",  "primary_key" : true, "mandatory" : true}, {"name" : "RatingAverage", "primary_key" : false, "mandatory" : true }, {"name" : "RatingCount", "primary_key" : false, "mandatory" : true}];
    }
    else if(table_name == 'Genre'){
        return [{"name" : "GenreID",  "primary_key" : true, "mandatory" : true}, {"name" : "GenreName",  "primary_key" : false, "mandatory" : true}];
    }
    else if(table_name == 'MoviesInGenre'){
        return [{"name" : "MovieID", "primary_key" : true, "mandatory" : true}, {"name" : "GenreID", "primary_key" : true, "mandatory" : true}];
    }
    else if(table_name == 'Production'){
        return [{"name" : "ProductionID",  "primary_key" : true, "mandatory" : true}, {"name" : "ProductionName",  "primary_key" : false, "mandatory" : true}];
    }
    else if(table_name == 'MoviesByProduction'){
        return [{"name" : "MovieID", "primary_key" : true, "mandatory" : true}, {"name" : "ProductionID", "primary_key" : true, "mandatory" : true}];
    }
    else if(table_name == 'SearchKeywords'){
        return [{"name" : "SearchKeywordID",  "primary_key" : true, "mandatory" : true}, {"name" : "SearchKeyword",  "primary_key" : false, "mandatory" : true}];
    }
    else if(table_name == 'MoviesToSearchKeywords'){
        return [{"name" : "MovieID", "primary_key" : true, "mandatory" : true}, {"name" : "SearchKeywordID", "primary_key" : true, "mandatory" : true}];
    }

}

function showInsertTable(table_name){
    let $parent_div = $("#admin-table");
    table_cols = get_table_cols(table_name);

    for(let i = 0; i < table_cols.length; i++){
        let id = table_name + "_" + table_cols[i]['name'];
        let placeholder = "Enter the " + table_cols[i]['name'];
        $parent_div.append("<input class='admin-table-input' type='text' id='" + id +"' placeholder='" + placeholder + "'></input>");
        if(table_cols[i]['mandatory']){
            $parent_div.append("<span class='mandatory-star'>*</span>");
        }
    }

    $parent_div.append("<button id='insert-button' class='button-53'>Insert " + table_name + "</button>");

    $("#insert-button").click(function (){
        let cols = [];
        let values = []
        for(let i = 0; i < table_cols.length; i++){
            let id = table_name + "_" + table_cols[i]['name'];
            let crnt_val = $("#" +  id).val();
            if(crnt_val.length){
                cols.push(table_cols[i]['name']);
                values.push(crnt_val);
            }
        }
        $.ajax({
            type: "POST",
            url: url + "insert_table",
            data: {
                table_name : table_name,
                cols : cols.toString(),
                values : values.toString()
            },
            success : function (data){
                if(data.status){
                    $("#admin-select-table select").val("default");
                    alert("Value Inserted Successfully");
                    $("#admin-table").empty();
                }
                else{
                    alert("Error while Inserting Data");
                }

            },
            error : function (data){
                alert("Error while Inserting Data");
            }
        });
    });
}

function showUpdateTable(table_name){
    let $parent_div = $("#admin-table");
    table_cols = get_table_cols(table_name);

    for(let i = 0; i < table_cols.length; i++){
        if(!table_cols[i].primary_key){
            continue;
        }
        let id = table_name + "_" + table_cols[i]['name'];
        let placeholder = "Enter the " + table_cols[i]['name'];
        $parent_div.append("<input class='admin-table-input' type='text' id='" + id +"' placeholder='" + placeholder + "'></input>");
        if(table_cols[i]['mandatory']){
            $parent_div.append("<span class='mandatory-star'>*</span>");
        }
    }

    $parent_div.append("<button id='load-button' class='button-53'>Get " + table_name + "</button>");

    $("#load-button").click(function (){
        let cols = [];
        let values = []
        for(let i = 0; i < table_cols.length; i++){
            if(!table_cols[i].primary_key){
                continue;
            }
            let id = table_name + "_" + table_cols[i]['name'];
            let crnt_val = $("#" +  id).val();
            if(crnt_val.length){
                cols.push(table_cols[i]['name']);
                values.push(crnt_val);
            }
        }
        $.ajax({
            type: "GET",
            url: url + "get_table",
            data: {
                table_name : table_name,
                cols : cols.toString(),
                values : values.toString()
            },
            success : function (data){
                if(data.values.length){
                    $("#admin-table").empty();
                    showUpdateData(table_name, data.values[0]);
                }
                else{
                    alert("No Data Found");
                }

            },
            error : function (data){
                alert("Error while Getting Data");
            }
        });
    });
}

function showUpdateData(table_name, values){
    let $parent_div = $("#admin-table");
    table_cols = get_table_cols(table_name);

    for(let i = 0; i < table_cols.length; i++){
        let id = table_name + "_" + table_cols[i]['name'];
        let placeholder = "Enter the " + table_cols[i]['name'];
        $parent_div.append("<div><div class='update-header'>"+ table_cols[i]['name'] +"</div><input class='admin-table-input' type='text' id='" + id +"' placeholder='" + placeholder + "' value='"+ values[i] +"'></input></div>");
        if(table_cols[i]['primary_key']){
            $("#" + id).attr('readonly','readonly');
            $("#" + id).attr('disabled','disabled');
        }
        if(table_cols[i]['mandatory']){
            $parent_div.append("<span class='mandatory-star'>*</span>");
        }
    }

    $parent_div.append("<button id='update-button' class='button-53'>Update " + table_name + "</button>");

    $("#update-button").click(function (){
        let cols = [];
        let values = [];
        let where_cols = [];
        let where_values = [];
        for(let i = 0; i < table_cols.length; i++){
            let id = table_name + "_" + table_cols[i]['name'];
            let crnt_val = $("#" +  id).val();
            if(crnt_val.length){
                if(table_cols[i]['primary_key']){
                     where_cols.push(table_cols[i]['name']);
                     where_values.push(crnt_val);
                }
                else{
                    cols.push(table_cols[i]['name']);
                    values.push(crnt_val);
                }
            }
        }
        $.ajax({
            type: "PUT",
            url: url + "update_table",
            data: {
                table_name : table_name,
                cols : cols.toString(),
                values : values.toString(),
                where_cols : where_cols.toString(),
                where_values : where_values.toString()
            },
            success : function (data){
                if(data.status){
                    $("#admin-select-table select").val("default");
                    alert("Value Updated Successfully");
                    $("#admin-table").empty();
                }
                else{
                    alert("Error while Updating Data");
                }

            },
            error : function (data){
                alert("Error while Updating Data");
            }
        });
    });
}

function showDeleteTable(table_name){
    let $parent_div = $("#admin-table");
    table_cols = get_table_cols(table_name);

    for(let i = 0; i < table_cols.length; i++){
        if(!table_cols[i].primary_key){
            continue;
        }
        let id = table_name + "_" + table_cols[i]['name'];
        let placeholder = "Enter the " + table_cols[i]['name'];
        $parent_div.append("<input class='admin-table-input' type='text' id='" + id +"' placeholder='" + placeholder + "'></input>");
        if(table_cols[i]['mandatory']){
            $parent_div.append("<span class='mandatory-star'>*</span>");
        }
    }

    $parent_div.append("<button id='delete-button' class='button-53'>Delete " + table_name + "</button>");

    $("#delete-button").click(function (){
        let cols = [];
        let values = []
        for(let i = 0; i < table_cols.length; i++){
            if(!table_cols[i].primary_key){
                continue;
            }
            let id = table_name + "_" + table_cols[i]['name'];
            let crnt_val = $("#" +  id).val();
            if(crnt_val.length){
                cols.push(table_cols[i]['name']);
                values.push(crnt_val);
            }
        }
        $.ajax({
            type: "POST",
            url: url + "delete_table",
            data: {
                table_name : table_name,
                cols : cols.toString(),
                values : values.toString()
            },
            success : function (data){
                if(data.status){
                    $("#admin-select-table select").val("default");
                    alert("Row Deleted Successfully");
                    $("#admin-table").empty();
                }
                else{
                    alert("Error while Deleting Data");
                }

            },
            error : function (data){
                alert("Error while Deleting Data");
            }
        });
    });
}

function getAllMovieByGenre(){
    $.ajax({
        type: "GET",
        url: url + "get_movie_by_genre",
        data: {
            genre : $("#get-genre").val(),
            limit : 10,
            offset : current_offset
        },
        success : function (data){
            display_movie_details(movie_table_headers, data.movie);
            $("#next-button-div").removeClass("hidden");
        }
    });
}

function getAllMovieByProduction(){
    $.ajax({
        type: "GET",
        url: url + "get_movie_by_production",
        data: {
            production : $("#get-production").val(),
            limit : 10,
            offset : current_offset
        },
        success : function (data){
            display_movie_details(movie_table_headers, data.movie);
            $("#next-button-div").removeClass("hidden");
        }
    });
}

function getAllMovieByKeyword(){
    $.ajax({
        type: "GET",
        url: url + "get_movie_by_keyword",
        data: {
            search_keyword : $("#get-keyword").val(),
            limit : 10,
            offset : current_offset
        },
        success : function (data){
            display_movie_details(movie_table_headers, data.movie);
            $("#next-button-div").removeClass("hidden");
        }
    });
}

function getMovie(col, val){
    $.ajax({
        type: "GET",
        url: url + "get_movie",
        data: {
            col : col,
            val : val,
            limit : 1,
            offset : 0
        },
        success : function (data){
            display_movie_details(movie_table_headers, data.movie);
        }
    });
}

function getAllMovie(){
    $.ajax({
        type: "GET",
        url: url + "get_all_movie",
        data: {
            limit : 10,
            offset : current_offset
        },
        success : function (data){
            display_movie_details(movie_table_headers, data.movie);
            $("#next-button-div").removeClass("hidden");
        }
    });
}

function getTopMovies(api){
    $.ajax({
        type: "GET",
        url: url + api,
        success : function (data){
            let header = movie_table_headers.slice()
            if(api == 'get_top_rated'){
                header = header.concat(["Rating Average", "Rating Count"])
            }
            display_movie_details(header, data.movie);
        }
    });
}

function populate_genre(){
const genre_data = [{'name': 'Animation', 'value': 'Animation'}, {'name': 'Comedy', 'value': 'Comedy'},
              {'name': 'Family', 'value': 'Family'}, {'name': 'Adventure', 'value': 'Adventure'},
              {'name': 'Fantasy', 'value': 'Fantasy'}, {'name': 'Romance', 'value': 'Romance'},
              {'name': 'Drama', 'value': 'Drama'}, {'name': 'Action', 'value': 'Action'},
              {'name': 'Crime', 'value': 'Crime'}, {'name': 'Thriller', 'value': 'Thriller'},
              {'name': 'Horror', 'value': 'Horror'}, {'name': 'History', 'value': 'History'},
              {'name': 'Science Fiction', 'value': 'Science Fiction'}, {'name': 'Mystery', 'value': 'Mystery'},
              {'name': 'War', 'value': 'War'}, {'name': 'Foreign', 'value': 'Foreign'},
              {'name': 'Music', 'value': 'Music'}, {'name': 'Documentary', 'value': 'Documentary'},
              {'name': 'Western', 'value': 'Western'}, {'name': 'TV Movie', 'value': 'TV Movie'},
              {'name': 'Short Film', 'value': 'Short Film'}];

    for(let i =0;i < genre_data.length;i++){
        let $option = $('<option>'+genre_data[i].name+'</option>');
        $option.val(genre_data[i].value);
        $("#get-genre").append($option);
    }
}

function populate_admin_tables(){
    const insert_table_data = [{"name":"Movie","value":"Movie"}, {"name":"MovieRating","value":"MovieRating"}, {"name":"Genre","value":"Genre"}, {"name":"MoviesInGenre","value":"MoviesInGenre"}, {"name":"Production","value":"Production"}, {"name":"MoviesByProduction","value":"MoviesByProduction"}, {"name":"SearchKeywords","value":"SearchKeywords"}, {"name":"MoviesToSearchKeywords","value":"MoviesToSearchKeywords"}];
    for(let i =0;i < insert_table_data.length;i++){
        $("#insert-table").append($('<option value='+insert_table_data[i].value+'>'+insert_table_data[i].name+'</option>'));
    }

    const update_table_data = [{"name":"Movie","value":"Movie"}, {"name":"MovieRating","value":"MovieRating"}, {"name":"Genre","value":"Genre"}, {"name":"Production","value":"Production"}, {"name":"SearchKeywords","value":"SearchKeywords"}];
    for(let i =0;i < update_table_data.length;i++){
        $("#update-table").append($('<option value='+update_table_data[i].value+'>'+update_table_data[i].name+'</option>'));
    }

    const delete_table_data = insert_table_data;
    for(let i =0;i < delete_table_data.length;i++){
        $("#delete-table").append($('<option value='+delete_table_data[i].value+'>'+delete_table_data[i].name+'</option>'));
    }
}

function show_login(){
    $("#login-page-button").addClass('hidden');
    $("#login-details").removeClass('hidden');
}

function check_login(){
    $.ajax({
        type: "GET",
        url: url + "check_login",
        data: {
            user_name : $("#get-user-name").val(),
            pwd : $("#get-password").val()
        },
        success : function (response){
            if(response.login_status){
                $("#login-details").addClass('hidden');
                showAdminSection();
                $("#logout-button").removeClass('hidden');
            }
            else{
                alert("Invalid Login");
            }
        }
    });
}

function showAdminSection(){
    $("#admin-section").removeClass("hidden");
}

(function() {
    bindEvents();
    populate_genre();
    populate_admin_tables();
    $("#all-movies").trigger("click");
})();