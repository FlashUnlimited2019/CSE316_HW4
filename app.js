var mysql = require("mysql");
var con = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "asd123",
    database: "mydb"
});

const express = require("express");
const app = express();
const url = require('url');

app.get("/",(req,res) => {
  writeSearch(req,res);
});

app.get("/schedule", (req,res)=>{
  writeSchedule(req,res);
});

port = process.env.PORT || 3000;
app.listen(port, ()=>{
  console.log("server started!");
})

function writeSearch(req,res){
  res.writeHead(200, {"Content-Type": "text/html"});
  let query = url.parse(req.url, true).query;
  
  let search = query.search ? query.search : "";
  let filter = query.filter ? query.filter : "";

  let html = `
<!DOCTYPE html>
<html lang="en">

<head>
  <title> Spring 2021 CSE Class Find </title>
</head>

<body>
  <h1>Spring 2021 CSE Class Find </h1><br>
  <form method="get" action = "/">
    <input type="text" name="search" value=""></input>
    <b>in</b>
    <select name="filter">
      <option value="allFields">All Field</opiton>
      <option value="courseName">Course Title</opiton>
      <option value="courseNum">Course Num</opiton>
      <option value="instructor">Instructor</opiton>
      <option value="day">Day</opiton>
      <option value="time">Time</opiton>
    </select>
    <input type="submit" value="Submit"></input>
    <br>
    Example searches: 316, fodor, 2:30 PM, NW
  </form>
  <br><br>
  `;

  let sql = "SELECT * FROM courses;";

  // sql to search all columns
  if (filter == "allFields"){
    sql = `SELECT * FROM courses 
      WHERE Subject LIKE '%` + search + `%' OR
      Course LIKE '%` + search + `%' OR
      CourseName LIKE '%` + search + `%' OR
      Component LIKE '%` + search + `%' OR
      Section LIKE '%` + search + `%' OR
      Days LIKE '%` + search + `%' OR
      StartTime LIKE '%` + search + `%' OR
      EndTime LIKE '%` + search + `%' OR
      StartDate LIKE '%` + search + `%' OR
      EndDate LIKE '%` + search + `%' OR
      Duration LIKE '%` + search + `%' OR
      InstructionMode LIKE '%` + search + `%' OR
      Building LIKE '%` + search + `%' OR
      Room LIKE '%` + search + `%' OR
      Instructor LIKE '%` + search + `%' OR
      EnrollCap LIKE '%` + search + `%' OR
      WaitCap LIKE '%` + search + `%' OR
      CombDesc LIKE '%` + search + `%' OR
      CombEnrollCap LIKE '%` + search + `%' OR
      CourseName LIKE '%` + search + `%';`;
  }else if(filter == "courseNum"){
      sql = `SELECT * FROM courses
      WHERE Course LIKE '%` + search + `%'; `;

  }else if(filter == "courseName"){
    sql = `SELECT * FROM courses
    WHERE CourseName LIKE '%` + search + `%'; `;

  }else if(filter == "instructor"){
    sql = `SELECT * FROM courses
    WHERE Instructor LIKE '%` + search + `%'; `;

  }else if(filter == "day"){
    sql = `SELECT * FROM courses
    WHERE Days LIKE '%` + search + `%'
    ORDER BY StartTimeInternal; `;

  }else if(filter == "time"){
    sql = `SELECT * FROM courses
    WHERE StartTime LIKE '%` + search + `%' OR
      EndTime Like '%` + search +`%'; `;
  }
  con.query(sql, function(err,result){
    if(err) throw err;
    // html = "";
    for(let item of result){
      
      html += `
      <div type="button" class="toggle"> CSE ` + item.Course + `-` +
      item.CourseName + `-` + item.Component + ` - Section` + item.Section + `</div>
      <pre>
        Days: ` + item.Days + `
        Start Time: ` + item.StartTime + `
        End Time: ` + item.EndTime + `
        Start Date: ` + item.StartDate + `
        End Date: ` + item.EndDate + `
        Duration: ` + item.Building + `
        Instruction Mode: ` + item.InstructionMode + `
        Building: ` + item.Building + `
        Room: ` + item.Room + `
        Instructor: ` + item.Instructor + `
        Enrollment Cap: ` + item.EnrollCap +`
        Wait Cap: ` + item.WaitCap +`
        Combined Description: ` + item.CombDesc +`
        Combined Enrollment Cap: ` + item.CombEnrollCap + ` <form action="/schedule" method="get">
        <button name = "add" value="` + item.id + `"> Add Class </button></form> </pre>`;
    }
      res.write(html + "\n\n</body>\n</html>");
      res.end();
  });

};

function writeSchedule(req, res){
  let query = url.parse(req.url, true).query;
  let addQuery = `INSERT INTO saved SELECT * FROM courses WHERE courses.id="` + query.add + `";`

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title> Schedule </title>
      <style type = text/css>
        table, tr, th, td{
          border: 1px solid black;
          height: 50px;
          vertical-align: bottom;
          padding: 15px;
          text-align: left;
        }
      </style>  
    </head>
    <body>
        <h1> Schedule </h1><br>
        <a href="/"><b>Return to Search</b></a>
        <br><br>

        <table>
          <tr>
            <th> Mon </th>
            <th> Tue </th>
            <th> Wed </th>
            <th> Thu </th>
            <th> Fri </th>
          </tr>
          <tr>
            <td> Mon </td>
            <td> Tue </td>
            <td> Wed </td>
            <td> Thu </td>
            <td> Fri </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  
  con.query(addQuery, function(err, result){
    if(err) console.log(err);
    con.query(constructSQLDayCommand("M"), function(err, result){
      if(err) throw err;
      html = html.replace("<td> Mon </td>", getDay(result, "MON"));
      con.query(constructSQLDayCommand("TU"), function(err, result){
        if (err) throw err;
        html = html.replace("<td> Tue </td>", getDay(result, "TUE"));
        con.query(constructSQLDayCommand("W"),function(err, result){
          if (err) throw err;
          html = html.replace("<td> Wed </td>", getDay(result, "WED"));
          con.query(constructSQLDayCommand("TH"),function(err, result){
            if (err) throw err;
            html = html.replace("<td> Thu </td>", getDay(result, "THU"));
            con.query(constructSQLDayCommand("F"),function(err, result){
              if (err) throw err;
              html = html.replace("<td> Fri </td>", getDay(result, "FRI"));
              res.write(html + "\n\n<body>\n</html>");
              res.end();
            });
          });
        });
      });
    });
  });
    

}

function getDay(SQLResult, tableHeader){
  let retStr = "<td>"
  for (let item of SQLResult){
    retStr += "\n       <b>" + item.StartTime + " - " + 
                        item.EndTime + " <br><br> " + 
                        item.Subject + " " +
                        item.Course + "-" +
                        item.Section + " </b> <p> " +
                        item.CourseName + "<br><br>" +
                        item.Instructor + "<br><br>" +
                        "<br/><br/>";
  }
  return retStr + "</td>";
}

function constructSQLDayCommand(search) {
  var sql = `SELECT * FROM saved 
            WHERE Days    LIKE '%` + search + `%'
            ORDER BY StartTimeInternal;`;
  return sql;          
}

















