import { Component, OnInit, RendererStyleFlags2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GoogleCharts } from 'google-charts';
//import{ vege} from 'vega'
//import 'd3';
//import 'vega';
//import 'vega-lite';
//import 'vega-embed';
;

import {VisualizationSpec } from 'vega-embed';




//import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap'
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { forEach } from '@angular/router/src/utils/collection';
//import { ApiService } from './analytics.service';

const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;


@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styles: [`
    .custom-day {
      text-align: center;
      padding: 0.185rem 0.25rem;
      display: inline-block;
      height: 2rem;
      width: 2rem;
    }
    .custom-day.focused {
      background-color: #e6e6e6;
    }
    .custom-day.range, .custom-day:hover {
      background-color: rgb(2, 117, 216);
      color: white;
    }
    .custom-day.faded {
      background-color: rgba(2, 117, 216, 0.5);
    }
  `]
})

export class AnalyticsComponent implements OnInit {
  Access: object;
  ChartRecordIndicator: object;
  Network: object;
  ChartRecordCDCPopular: object;
  RecordDaily: object;
  res2: object;
  sessioncount;
  noteData: object;
  start_period;
  end_period;
  ChartParam = {}
  isOn = ''
  date_Range = '';
  alertflag = '';
  alertMsg = "";
  hoveredDate: NgbDateStruct;
  fromDate: NgbDateStruct;
  toDate: NgbDateStruct;
  noteDate: NgbDateStruct;
  public isCollapsed = true;
  note_description;
  note_title;
  user;
  note_id;
  date: { year: number, month: number };
  date_of_note;
  AnalyticsNotes = {};
  ClearNoteButton = false;
  UpdateNoteButton = false;
  CrateNoteButton = false;
  previousPage=1;
  NextPage=2;
  alertNoteflag=false;
  alertMsgNote;
  Pagecount=[];
  TotalPage;
  
  constructor(private http: HttpClient, calendar: NgbCalendar) {

    // this.fromDate = calendar.getToday();
    // this.toDate = calendar.getPrev(calendar.getToday(), 'd', 30);
  }


  ngOnInit() {

  }
  onDateSelection(date: NgbDateStruct) {
    this.alertMsg = '';
    this.alertflag = '';
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
      this.date_Range = this.date_Range + this.fromDate.month + '/' + this.fromDate.day + '/' + this.fromDate.year;
    } else if (this.fromDate && !this.toDate && after(date, this.fromDate)) {
      this.toDate = date;
      this.date_Range = this.date_Range + " to " + this.toDate.month + '/' + this.toDate.day + '/' + this.toDate.year;
    } else {
      this.toDate = null;
      this.fromDate = date;
      this.date_Range = this.fromDate.month + '/' + this.fromDate.day + '/' + this.fromDate.year;

    }


  }
  GetDaily() {
    this.isCollapsed =true;
    var sflag = 0;
    var eflag = 0;
    if (this.fromDate != null) {
      sflag = 1;
      this.ChartParam["start_period"] = this.fromDate.month + '/' + this.fromDate.day + '/' + this.fromDate.year;
    }
    else {
      this.alertflag = 'true';
      this.alertMsg = "Please select from date";
    }
    if (this.toDate != null) {
      eflag = 1
      this.ChartParam["end_period"] = this.toDate.month + '/' + this.toDate.day + '/' + this.toDate.year;
    }
    else {
      this.alertflag = 'true';
      this.alertMsg = "Please select to date";
    }
    if (sflag == 1 && eflag == 1) {
      this.isOn = "";
      console.log(this.ChartParam);
      this.http.post('http://appbesp101/moreinfoapi/api/Analytics/GetAllData', this.ChartParam).subscribe(res => {
        // this.http.post('http://localhost:20031//api/Analytics/GetAllData',this.ChartParam).subscribe(res => {
        //  this.http.get('http://appbesp101/moreinfoapi/api/Analytics/GetAllData').subscribe(res => {
        this.res2 = res;
        GoogleCharts.load(drawBasic);
        this.RecordDaily = res['RecordDaily'];
        this.ChartRecordIndicator = res['ChartRecordIndicator'];
        this.Network = res['Network'];
        this.ChartRecordCDCPopular = res['ChartRecordCDCPopular'];
        this.Access = res['Access'];

        var j = 0;
        var count = 0;
        for (var k in res['RecordDaily']) {
          count = count + res['RecordDaily'][j].session;
          j++;


        }
        this.sessioncount = count;
        function drawBasic() {
          var data = new GoogleCharts.api.visualization.DataTable();
          data.addColumn('date', 'Date');
          data.addColumn('number', 'Session');
          var j = 0;
          for (var k in res['RecordDaily']) {
            //   this.sessioncount= this.sessioncount+res['RecordDaily'][j].session;
            data.addRows([
              [new Date(res['RecordDaily'][j].moy), res['RecordDaily'][j].session]]);
            j++;

          }
          var options = {
            hAxis: {
              title: 'Time'
            },
            vAxis: {
              title: 'Session'
            }
          };
          var chart = new GoogleCharts.api.visualization.LineChart(document.getElementById('chart_div'));
          chart.draw(data, options);

        }

      });

    }

  }

  GetNoteData() {
    this.previousPage=1;
    this.NextPage=2;
    this.isCollapsed = !this.isCollapsed;
    if (!this.isCollapsed) {
      this.noteData
      this.http.get('http://appbesp101/moreinfoapi/api/Analytics/GetNoteData').subscribe(res => {
        this.noteData = res;
        this.Pagecount=[];
        this.TotalPage=res[0]["TotalPageCount"];
        for (var i = 1; i <= res[0]["TotalPageCount"]; i++) {
         this.Pagecount.push(i);
       }
        //console.log(res[0]["TotalPageCount"])
      });
      this.ClearNoteButton = true;
      this.CrateNoteButton = true;
    }
  }

  GetNoteDataOnly()
  {
    this.http.get('http://appbesp101/moreinfoapi/api/Analytics/GetNoteData').subscribe(res => {
      this.noteData = res;
      this.Pagecount=[];
      this.TotalPage=res[0]["TotalPageCount"];
      for (var i = 1; i <= res[0]["TotalPageCount"]; i++) {
       this.Pagecount.push(i);
     }
    });
  }
  ClearNoteData() {
    this.ClearNoteButton = true;
    this.UpdateNoteButton = false;
    this.CrateNoteButton = true;
    this.alertNoteflag=false;
    this.user = ""
    this.note_description = "";
    this.note_title = "";
    this.note_id = "";
    const now = new Date();
    this.date_of_note = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
  }
  UpdateNoteData() {
    this.alertNoteflag=true;
    this.AnalyticsNotes["note_title"] = this.note_title;
    this.AnalyticsNotes["note_description"] = this.note_description;
    this.AnalyticsNotes["note_id"] = this.note_id
    this.AnalyticsNotes["user"] = this.user;
    if(this.date_of_note!=null)
    {
    this.AnalyticsNotes["date_of_note"] =  this.date_of_note.month + '/' + this.date_of_note.day + '/' + this.date_of_note.year; 
    this.http.post('http://appbesp101/moreinfoapi/api/Analytics/UpDateNoteData', this.AnalyticsNotes).subscribe(res => {
     if (res == "Successful") {
          this.GetNoteDataOnly();
         this.alertMsgNote="Updated Successfully";
      } else {
        this.alertMsgNote="Already exists";
      }
    });
  }
  else{
    this.alertMsgNote=" Please select data of note";
  }
  }
  CreateNoteData() {
 
    this.alertNoteflag=true;
    this.AnalyticsNotes["note_title"] = this.note_title;
    this.AnalyticsNotes["note_description"] = this.note_description;
    this.AnalyticsNotes["user"] = this.user;
    this.AnalyticsNotes["date_of_note"] =  this.date_of_note.month + '/' + this.date_of_note.day + '/' + this.date_of_note.year;
    debugger 
    if(this.date_of_note!=null)
    {
    this.http.post('http://appbesp101/moreinfoapi/api/Analytics/InsertNoteData', this.AnalyticsNotes).subscribe(res => {
       if (res == "Successful") {
        this.GetNoteDataOnly();
        this.alertMsgNote="Inserted Successfully";
      } else {
        this.alertMsgNote="Already exists";
      }
    });
  }
    else{
      this.alertMsgNote=" Please select data of note";
    }
  }
  EditNoteData(result) {

    this.user = result.user
    this.note_description = result.note_description;
    this.note_title = result.note_title;
    this.note_id = result.note_id; //result.date_of_note
    const now = new Date(result.date_of_note);
    this.date_of_note = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
    this.ClearNoteButton = true;
    this.UpdateNoteButton = true;
    this.CrateNoteButton = false;
    this.alertNoteflag=false

  }
  dateragneHideAndShow() {
    this.isCollapsed =true;
    if (this.isOn == "") {
      this.isOn = "false";
    }
    else {
      this.isOn = "";
    }
  }
  DeleteNoteData(result){
    this.AnalyticsNotes["note_title"] = result.note_title;
    this.AnalyticsNotes["note_description"] = result.note_description;
    this.AnalyticsNotes["note_id"] = result.note_id
    this.AnalyticsNotes["user"] = result.user;
      this.http.post('http://appbesp101/moreinfoapi/api/Analytics/DeleteNoteData', this.AnalyticsNotes).subscribe(res => {
       if (res == "Successful") {
        this.GetNoteDataOnly();
        this.ClearNoteButton = true;
        this.UpdateNoteButton = false;
        this.CrateNoteButton = true;
         this.user = ""
        this.note_description = "";
        this.note_title = "";
        this.note_id = "";
        const now = new Date();
        this.date_of_note = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
        this.alertMsgNote="Deleted Successfully";
      } else {
        this.alertMsgNote="Delete Error";
      }
    });
  }
  onResize(event) {
    alert("hires")
    var j = 0;
    var count = 0;
    for (var k in this.res2['RecordDaily']) {
      count = count + this.res2['RecordDaily'][j].session;
      j++;


    }
    this.sessioncount = count;
    GoogleCharts.load(drawBasic(this.res2));
    function drawBasic(res2) {
    
      var data = new GoogleCharts.api.visualization.DataTable();
      data.addColumn('date', 'Date');
      data.addColumn('number', 'Session');
      var j = 0;
      for (var k in res2['RecordDaily']) {
        data.addRows([
          [new Date(res2['RecordDaily'][j].moy), res2['RecordDaily'][j].session]]);
        j++;

      }
      var options = {
        hAxis: {
          title: 'Time'
        },
        vAxis: {
          title: 'Session'
        }
      };
      var chart = new GoogleCharts.api.visualization.LineChart(document.getElementById('chart_div'));
      chart.draw(data, options);

    }
  }
  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);
///Pagination
PageRequested(page){
  if(page!=1)
  {
  this.previousPage=page-1;
  }
  if(page!= this.TotalPage)
  {
  this.NextPage=page+1;
  }
  this.AnalyticsNotes["page"] = page
        this.http.post('http://appbesp101/moreinfoapi/api/Analytics/GetNoteDataByPage', this.AnalyticsNotes).subscribe(res => {
        if (!this.isCollapsed) {
          this.noteData
            this.noteData = res;
            this.Pagecount=[];
            for (var i = 1; i <= res[0]["TotalPageCount"]; i++) {
             this.Pagecount.push(i);
           }
               
          this.ClearNoteButton = true;
          this.CrateNoteButton = true;
        }
   
    });


}

Vegacode(){

  
 
//  vege.vegaEmbed('#visBar', yourVlSpec, opt = { "renderer": "svg" }).then(function (result) {
  ////})
//.catch(console.error);
}
}

