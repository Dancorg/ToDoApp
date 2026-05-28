import { Locator, Page } from "@playwright/test";

export class TodoCard {
    readonly item:Locator;
    readonly checkbox:Locator;
    readonly title:Locator;
    readonly priority:Locator;
    readonly category:Locator;
    readonly dueDate:Locator;
    readonly edit:Locator;
    readonly delete:Locator;

    constructor(readonly page:Page, readonly index:string | number){
        this.page = page;
        this.item = page.getByTestId(`todo-item-${index}`);
        this.checkbox = page.getByTestId(`checkbox-${index}`);
        this.title = page.getByTestId(`todo-title-${index}`);
        this.priority = page.getByTestId(`priority-badge-${index}`);
        this.category = page.getByTestId(`category-badge-${index}`);
        this.dueDate = page.getByTestId(`due-date-${index}`);
        this.edit = page.getByTestId(`edit-btn-${index}`);
        this.delete = page.getByTestId(`delete-btn-${index}`);
    };

    async completeTask(){
        await this.checkbox.check();
    }

};