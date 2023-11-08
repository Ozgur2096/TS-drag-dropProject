"use strict";
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["active"] = 0] = "active";
    ProjectStatus[ProjectStatus["finished"] = 1] = "finished";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
}
class ProjectState extends State {
    constructor() {
        super();
        this.projects = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addProject(title, description, numOfPeople) {
        const newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.active);
        this.projects.push(newProject);
        this.updateListeners();
    }
    moveProject(projectId, newStatus) {
        const movedProject = this.projects.find(project => project.id === projectId);
        if (movedProject && movedProject.status !== newStatus) {
            movedProject.status = newStatus;
        }
        this.updateListeners();
    }
    updateListeners() {
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}
const projectState = ProjectState.getInstance();
function validate(validationObject) {
    let isValid = true;
    if (validationObject.required) {
        isValid = isValid && validationObject.value.toString().trim().length !== 0;
    }
    if (validationObject.minLength != null &&
        typeof validationObject.value === 'string') {
        isValid =
            isValid && validationObject.value.length >= validationObject.minLength;
    }
    if (validationObject.maxLength != null &&
        typeof validationObject.value === 'string') {
        isValid =
            isValid && validationObject.value.length <= validationObject.maxLength;
    }
    if (validationObject.min != null &&
        typeof validationObject.value === 'number') {
        isValid = isValid && validationObject.value > validationObject.min;
    }
    if (validationObject.max != null &&
        typeof validationObject.value === 'number') {
        isValid = isValid && validationObject.value < validationObject.max;
    }
    return isValid;
}
class Component {
    constructor(templateId, hostElementId, insertAtStart, newElementId) {
        this.templateElement = document.getElementById(templateId);
        this.hostElement = document.getElementById(hostElementId);
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }
    attach(insertAtBeginning) {
        this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element);
    }
}
class ProjectItem extends Component {
    get persons() {
        if (this.project.people === 1) {
            return '1 person';
        }
        else {
            return `${this.project.people} persons`;
        }
    }
    constructor(hostId, project) {
        super('single-project', hostId, false, project.id);
        this.project = project;
        this.configure();
        this.renderContent();
    }
    dragStartHandler(event) {
        var _a;
        (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData('text/plain', this.project.id);
        event.dataTransfer.effectAllowed = 'move';
        console.log('drag start: ', event);
    }
    dragEndHandler(event) {
        console.log('drag end: ', event);
    }
    configure() {
        this.element.setAttribute('draggable', 'true');
        this.element.addEventListener('dragstart', e => {
            this.dragStartHandler(e);
        });
        this.element.addEventListener('dragend', e => {
            this.dragEndHandler(e);
        });
    }
    renderContent() {
        this.element.querySelector('h2').textContent = this.project.title;
        this.element.querySelector('h3').textContent = this.persons + ' assigned';
        this.element.querySelector('p').textContent = this.project.description;
    }
}
class ProjectList extends Component {
    constructor(type) {
        super('project-list', 'app', false, `${type}-projects`);
        this.type = type;
        this.assignedProjects = [];
        this.configure();
        this.renderContent();
    }
    dragOverHandler(event) {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault();
            const listEl = this.element.querySelector('ul');
            listEl === null || listEl === void 0 ? void 0 : listEl.classList.add('droppable');
        }
    }
    dropHandler(event) {
        var _a;
        console.log('drop handler: ', event);
        const projectId = (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData('text/plain');
        projectState.moveProject(projectId, this.type === 'active' ? ProjectStatus.active : ProjectStatus.finished);
        const listEl = this.element.querySelector('ul');
        listEl === null || listEl === void 0 ? void 0 : listEl.classList.remove('droppable');
    }
    dragLeaveHandler(_) {
        const listEl = this.element.querySelector('ul');
        listEl === null || listEl === void 0 ? void 0 : listEl.classList.remove('droppable');
    }
    configure() {
        this.element.addEventListener('dragover', e => {
            this.dragOverHandler(e);
        });
        this.element.addEventListener('dragleave', e => {
            this.dragLeaveHandler(e);
        });
        this.element.addEventListener('drop', e => {
            this.dropHandler(e);
        });
        projectState.addListener((projects) => {
            const relevantProjects = projects.filter(project => {
                if (this.type === 'active') {
                    return project.status === ProjectStatus.active;
                }
                else {
                    return project.status === ProjectStatus.finished;
                }
            });
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
    }
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul').id = listId;
        this.element.querySelector('h2').textContent =
            this.type.toUpperCase() + 'PROJECTS';
    }
    renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`);
        listEl.innerHTML = '';
        for (const projectItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector('ul').id, projectItem);
        }
    }
}
class ProjectInput extends Component {
    constructor() {
        super('project-input', 'app', true, 'user-input');
        this.titleInputElement = this.element.querySelector('#title');
        this.descriptionInputElement = this.element.querySelector('#description');
        this.peopleInputElement = this.element.querySelector('#people');
        this.configure();
        this.renderContent();
    }
    configure() {
        this.element.addEventListener('submit', e => {
            this.submitHandler(e);
        });
    }
    clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }
    gatherUserInput() {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;
        if (validate({ value: enteredTitle, required: true, minLength: 5 }) &&
            validate({ value: enteredDescription, required: true, minLength: 5 }) &&
            validate({ value: +enteredPeople, required: true, min: 0 })) {
            console.log('success');
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
        else {
            alert('Invalid  input');
            return;
        }
    }
    submitHandler(event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput;
            console.log(title, desc, people);
            projectState.addProject(title, desc, people);
            this.clearInputs();
        }
    }
    renderContent() { }
}
const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
//# sourceMappingURL=app.js.map