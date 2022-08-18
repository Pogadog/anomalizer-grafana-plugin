
interface Task {
    [key: string]: NodeJS.Timer
}

export default class Clock {

    tasks: Task

    constructor() {
        this.tasks = {}
    }

    addTask = (id: string, event: () => void, interval: number) => {
        this.tasks[id] = setInterval(event, interval);
        event();
    }

    removeTask = (id: string) => {
        clearInterval(this.tasks[id]);
    }

    removeAllTasks = () => {
        for (let id in this.tasks) {
            this.removeTask(id);
        }
    }

}
