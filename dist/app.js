"use strict";
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
class ProjectList {
    constructor(type) {
        this.type = type;
        this.templateElement = document.getElementById('project-list');
        this.hostElement = document.getElementById('app');
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = `${this.type}-projects`;
        this.attach();
        this.renderContent();
    }
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul').id = listId;
        this.element.querySelector('h2').textContent =
            this.type.toUpperCase() + 'PROJECTS';
    }
    attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    }
}
class ProjectInput {
    constructor() {
        this.templateElement = document.getElementById('project-input');
        this.hostElement = document.getElementById('app');
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = 'user-input';
        this.titleInputElement = this.element.querySelector('#title');
        this.descriptionInputElement = this.element.querySelector('#description');
        this.peopleInputElement = this.element.querySelector('#people');
        this.configure();
        this.attach();
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
            this.clearInputs();
        }
    }
    configure() {
        this.element.addEventListener('submit', e => {
            this.submitHandler(e);
        });
    }
    attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}
const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
//# sourceMappingURL=app.js.map