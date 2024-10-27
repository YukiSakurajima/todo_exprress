const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, 'views'));

const readFile = (filename) => {
    return new Promise((resolve, reject) => {
    // get data from file
    fs.readFile(filename, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        // tasks list data from file
        const tasks = JSON.parse(data)
        resolve(tasks)
        });
    })
}

const writeFile = (filename, data) => {
    return new Promise((resolve, reject) => {
    // get data from file
    fs.writeFile(filename, data, 'utf8', (err) => {
        if (err) {
            console.error(err);
            return;
        } 
        resolve(true)
        });
    })
}


app.get('/', (req, res) => {
    // tasks list data from file
    readFile('./tasks.json')
    .then(tasks => {
        res.render('index', {tasks: tasks})
    })
})

app.use(express.urlencoded({extended:true}));


app.post('/', (req, res) => {
    // tasks list data from file
    // if file is empty give error or smth//
    if (req.body.task.trim().length == 0) {
        return res.status(400).send('Task cannot be empty');
    }
    readFile('./tasks.json')
      .then(tasks => {
    
        // add new task
        // create new id automatically
        let index
        if(tasks.length === 0)
        {
            index = 0
        } else {
            index = tasks[tasks.length-1].id + 1;
        }
    
        // create task object
        const newTask = {
            "id" : index,
            "task" : req.body.task
        }
        console.log(newTask)
        // add form sent task to task array
        tasks.push(newTask)
        data = JSON.stringify(tasks, null, 2)
        writeFile('./tasks.json', data)    


        fs.writeFile('./tasks.json', data, 'utf-8', err => {
            if (err) {
                console.error(err);
                return;
            } else {
                console.log('saved')
            }
    
            // redirect to / to see result
            res.redirect('/')
        })
      })
    })

    app.get('/delete-task/:taskId', (req, res) => {
        let deletedTaskId = parseInt(req.params.taskId)
        readFile('./tasks.json')
        .then(tasks => {
            tasks.forEach((task, index) => {
                if(task.id === deletedTaskId) {
                    tasks.splice(index, 1)
                } 
            })
            data = JSON.stringify(tasks, null, 2)
            writeFile('./tasks.json', data) 
            // redirect to / to see results
            res.redirect('/')
        })
    })
   
    app.get('/delete-all-tasks', (req, res) => {
        readFile('./tasks.json')
            .then(tasks => {
                tasks = []; // Set tasks to an empty array
                const data = JSON.stringify(tasks, null, 2); // Format JSON nicely
    
                return writeFile('./tasks.json', data); // Write empty array to file
            })
            .then(() => {
                res.redirect('/'); // Redirect after file write completes
            })
            .catch(err => {
                console.error(err); // Log any errors
                res.status(500).send("Error deleting tasks");
            });
    });
    
    // update task
app.post('/update-task', (req, res) => {
	const updateTask = req.body
	let error = null
	if(req.body.task.trim().length == 0){
		error = 'Please insert correct task data'
		readFile('./tasks.json')
		.then(tasks => {
			res.render('update', {
			task: {task: updateTask.task, id: updateTask.taskId},
			error: error
		})
	})
} else {
// tasks list data from file	
	readFile('./tasks.json')
	.then(tasks => {
		tasks.forEach((task, index) => {
			if(task.id === parseInt(req.body.taskId)){
				task.task = req.body.task
			}
		})
	data = JSON.stringify(tasks, null, 2)
	writeFile('tasks.json', data)
	// redirect to / to see result
	res.redirect('/')
		})	
	}
})
app.get('/update-task/:taskId', (req,res)=> {
	let updateTaskId = parseInt(req.params.taskId)
	readFile('./tasks.json')
	.then(tasks => {
		tasks.forEach((task, index) => {
			if(task.id === updateTaskId){
				res.render('update',{
				task: task,
				error: null
				})
			}
		})
	})
})

    app.listen(3001, () => {
        console.log('Example app is started at http://localhost:3001')
    })
    
