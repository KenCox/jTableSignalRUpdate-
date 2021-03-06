﻿$(document).ready(function () {

    //ViewBag.ClientName is set to a random name in the Index action.
      
    var myClientName = $("#MyClientName").text();

    //Initialize jTable
    $('#StudentTableContainer').jtable({
        title: 'Student List',
        actions: {
            listAction: 'Home/StudentList?clientName=' + myClientName,
            deleteAction: 'Home/DeleteStudent?clientName=' + myClientName,
            updateAction: 'Home/UpdateStudent?clientName=' + myClientName,
            createAction: 'Home/CreateStudent?clientName=' + myClientName
        },
        fields: {
            StudentId: {
                title: 'Id',
                width: '8%',
                key: true,
                create: false,
                edit: false
            },
            Name: {
                title: 'Name',
                width: '21%'
            },
            EmailAddress: {
                title: 'Email address',
                list: false
            },
            Password: {
                title: 'User Password',
                type: 'password',
                list: false
            },
            Gender: {
                title: 'Gender',
                width: '12%',
                options: { 'M': 'Male', 'F': 'Female' }
            },
            CityId: {
                title: 'City',
                width: '11%',
                options: 'Home/GetCityOptions'
            },
            BirthDate: {
                title: 'Birth date',
                width: '13%',
                type: 'date',
                displayFormat: 'yy-mm-dd'
            },
            Education: {
                title: 'Education',
                list: false,
                type: 'radiobutton',
                options: { '1': 'Primary school', '2': 'High school', '3': 'University' }
            },
            About: {
                title: 'About this person',
                type: 'textarea',
                list: false
            },
            IsActive: {
                title: 'Status',
                width: '10%',
                type: 'checkbox',
                values: { 'false': 'Passive', 'true': 'Active' },
                defaultValue: 'true'
            },
            RecordDate: {
                title: 'Record date',
                width: '15%',
                type: 'date',
                displayFormat: 'yy-mm-dd',
                create: false,
                edit: false,
                sorting: false
            }
        }
    });

    //Load student list from server
    $('#StudentTableContainer').jtable('load');

    //Create SignalR object to get communicate with server
    var realTimeHub = $.connection.realTimeJTableDemoHub;

    //Define a function to get 'record created' events
    realTimeHub.client.RecordCreated = function (clientName, record) {
        console.log("cal done")
        if (clientName != myClientName) {
            console.log("enter into update filed")
            $('#StudentTableContainer').jtable('addRecord', {
                record: record,
                clientOnly: true
            });
        }
        console.log("going to upate filed")
        writeEvent(clientName + ' has <b>created</b> a new record with id = ' + record.StudentId, 'event-created');
    };

    //Define a function to get 'record updated' events
    realTimeHub.client.RecordUpdated = function (clientName, record) {
        if (clientName != myClientName) {
            $('#StudentTableContainer').jtable('updateRecord', {
                record: record,
                clientOnly: true
            });
        }

        writeEvent(clientName + ' has <b>updated</b> a new record with id = ' + record.StudentId, 'event-updated');
    };

    //Define a function to get 'record deleted' events
    realTimeHub.client.RecordDeleted = function (clientName, recordId) {
        if (clientName != myClientName) {
            $('#StudentTableContainer').jtable('deleteRecord', {
                key: recordId,
                clientOnly: true
            });
        }

        writeEvent(clientName + ' has <b>removed</b> a record with id = ' + recordId, 'event-deleted');
    };

    //Define a function to get 'chat messages'
    realTimeHub.client.GetMessage = function (clientName, message) {
        writeEvent('<b>' + clientName + '</b> has sent a message: ' + message, 'event-message');
    };

    $('#Message').keydown(function (e) {
        if (e.which == 13) { //Enter
            e.preventDefault();
            realTimeHub.client.sendMessage(myClientName, $('#Message').val());
            $('#Message').val('');
        }
    });

    // Start the connection with server
    $.connection.hub.start().done(function () {
        console.log("connection setup");
    });

    //A function to write events to the page
    function writeEvent(eventLog, logClass) {
        var now = new Date();
        var nowStr = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
        $('#EventsList').prepend('<li class="' + logClass + '"><b>' + nowStr + '</b>: ' + eventLog + '.</li>');
    }
});