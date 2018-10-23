const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

var mongoPath = 'mongodb://127.0.0.1/my_mongoose';

mongoose.connect(mongoPath, { useNewUrlParser: true });
var mongooseDb = mongoose.connection;

const app = express();

app.use(bodyParser.json());

var Schema = mongoose.Schema;

var projectSchema = {
    name: String,
    startDate: Date,
    dueDate: String, // can be calculated when we know start date and the project's duration
    sprintLength: Number,
    // project's task completion resolutiom e.g. [20,60,80] represents a project
    // on which we have trello lists of 0%, 20%, 60%, 80%, 100% (0 and 100 does not have to be saved)
    resolution: [Number],
    // list of developers that work on a project
    // freeWeeks is an array with indexes coresponding to the project weeks which represent in which
    // weeks the programmer is busy (true=busy, false=available)
    developers: [{
        name: String,
        email: String, // for trello authentication purposes
        freeWeeks: [Boolean]
    }],
    // seperate explenation
    taskContainers: [{ type: Schema.Types.ObjectId, ref: 'ContainersModel' }]
};

var containersSchema = {
    name: String, // container name
    week: Number, // the first project week it was asigned to (where 0 is the first week of the project)
    developers: [String], // we will represent a developer by is e-mail address
    tasks: [{ type: Schema.Types.ObjectId, ref: 'task' }]
};

var taskSchema = {
    name: String, // task name
    length: Number, // length of task in development days (we will sum them to generate the length of a container) - to check? the data might come in in work hours (ask Effort team)
    started: Boolean, // marks if the task already started in an earlier sprint (will be used in Sprint Creation Page)
    sprintNum: Number // when the task is assigned to a sprint - this field will hold the sprint number it belongs to
};


var ProjectModel = mongoose.model('projectModel', projectSchema);
var ContainersModel = mongoose.model('containersModel', containersSchema);
var TaskModel = mongoose.model('TaskModel', taskSchema);

app.post('/', (req, res) => {
    var project = new ProjectModel({
        name: req.body.name,
        sprintLength: parseInt(req.body.time)
    })
    project.save(function (err) {
        if (err) return handleError(err);
        var container = new ContainersModel({
            name: 'planner',
            week: 3,
            developers: ['ah z', 'av z', 'mb']
        })
        container.save(function (err) {
            if (err) return handleError(err);
            project.taskContainers.push(container);
            project.save(function (err) {
                if (!err) {
                }
            })
        });
    })
})

app.post('/setContainer', (req, res) => {
    ContainersModel.findOne({ name: 'planner' })
        .populate('taskContainers')
        .exec(function (err, container) {
            if (err) return handleError(err);
            console.log(container);
            var task = new TaskModel({
                name: 'db',
                length: 5,
                started: true,
                sprintNum: 3
            })
            task.save(function (err) {
                container.tasks.push(task);
                container.save(function (err) {
                    console.log("AAA");
                })
            })
        });
})

app.delete('/projects', (req, res) => {
    ProjectModel.remove({}, (err) => {
        console.log("all data of projects deleted");
    })
})
app.delete('/containers', (req, res) => {
    ContainersModel.remove({}, (err) => {
        console.log("all data of containers deleted");
    })
})

app.listen(3030);