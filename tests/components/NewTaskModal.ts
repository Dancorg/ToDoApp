import {Locator, Page} from '@playwright/test';

export class NewTaskModal {
    readonly titleInput: Locator;
    readonly descriptionInput: Locator;
    readonly priorityInput: Locator;
    readonly categoryInput: Locator;
    readonly dueDateInput: Locator;
    readonly notesInput: Locator;
    readonly cancelBtn: Locator;
    readonly close: Locator;
    readonly submitBtn: Locator;
    readonly titleError: Locator;
    readonly dueDateError: Locator

    constructor(readonly page: Page){
        this.page = page;
        this.titleInput = page.getByTestId('form-title');
        this.descriptionInput = page.getByTestId('form-description');
        this.priorityInput = page.getByTestId('form-priority');
        this.categoryInput = page.getByTestId('form-category');
        this.dueDateInput = page.getByTestId('form-due-date');
        this.notesInput = page.getByTestId('form-notes');
        this.cancelBtn = page.getByTestId('form-cancel-btn');
        this.close = page.getByTestId('form-modal-close');
        this.submitBtn = page.getByTestId('form-submit-btn');
        this.titleError = page.getByTestId('form-title-error')     
        this.dueDateError = page.getByTestId('form-due-date-error')   
    }

    async fillForm(options: {
        title? : string, 
        description? : string, 
        priority? : string, 
        category? : string, 
        dueDate? : string, 
        notes? : string} ) {
            options.title && await this.titleInput.fill(options.title);
            options.description && await this.descriptionInput.fill(options.description);
            options.priority && await this.priorityInput.selectOption(options.priority);
            options.category && await this.categoryInput.selectOption(options.category);
            options.dueDate && await this.dueDateInput.fill(options.dueDate);
            options.notes && await this.notesInput.fill(options.notes);
        }

    async submitForm(){
        await this.submitBtn.click();
    }

    async closeModal(){
        await this.close.click();
    }
};