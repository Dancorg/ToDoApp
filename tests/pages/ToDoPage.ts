import {Page, Locator, expect} from '@playwright/test';
import { TodoCard } from '../components/TodoCard';
import { NewTaskModal } from '../components/NewTaskModal';

export class ToDoPage {
    readonly url: string;
    readonly welcome: Locator;
    readonly addTask: Locator;
    readonly nightMode: Locator;
    readonly search: Locator;
    readonly statusFilter: Locator;
    readonly priorityFilter: Locator;
    readonly categoryFilter: Locator;
    readonly statTotal: Locator;
    readonly statActive: Locator;
    readonly statCompleted: Locator;
    readonly list: Locator;

    constructor(readonly page:Page){
        this.welcome = page.getByTestId('welcome-overlay');
        this.addTask = page.getByTestId('add-todo-btn');
        this.nightMode = page.getByTestId('theme-toggle');
        this.search = page.getByTestId('search-input');
        this.statusFilter = page.getByTestId('filter-status');
        this.priorityFilter = page.getByTestId('filter-priority');
        this.categoryFilter = page.getByTestId('filter-category');
        this.statTotal = page.getByTestId('stat-total');
        this.statActive = page.getByTestId('stat-active');
        this.statCompleted = page.getByTestId('stat-completed');
        this.list = page.getByTestId('todo-list');
        this.page = page;
        this.url = '/';
    }
    
    
    async goto(): Promise<this>{
        await this.page.goto(this.url, { waitUntil: "commit"});
        return this;
    }

    async waitForPageLoad():Promise<this>{
        await this.welcome.waitFor({state: 'visible'});
        await this.welcome.waitFor({state: 'hidden'});
        return this;
    }

    async expectToBeOnPage(): Promise<this> {
        await expect(this.page).toHaveURL(this.url);
        return this;
    }

    async getNewTask(): Promise<NewTaskModal>{
        await this.addTask.click();
        return new NewTaskModal(this.page);
    }

    async addNewTask(options:{}):Promise<NewTaskModal>{
        const newTask = await this.getNewTask();
        await newTask.fillForm(options);
        await newTask.submitForm();
        return newTask;
    }

    async getToDoCardByIndex(index:string | number): Promise<TodoCard>{
        return new TodoCard(this.page, index);
    }

    async getToDoCardByTitle(title:string): Promise<TodoCard>{
        const todo = this.page.getByText(title).nth(0);
        const testid = (await todo.getAttribute('data-testid'));
        const index = testid!.replace('todo-title-', '');
        return new TodoCard(this.page, index);
    }

    async getItemCount(): Promise<number>{
        return this.page.locator('[data-testid^="todo-item-"]').count();
    }
};