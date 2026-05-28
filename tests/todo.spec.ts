import { test, expect } from './fixtures/pages.fixtures';

interface Item {
    title: string,
    description?: string,
    priority?: string,
    category?: string,
    dueDate?: string,
    notes?: string,
}

const todoItems: Item[] = [{
    title: "New High Prio item",
    priority: "high",
    dueDate: "2026-12-01"
},{
    title: "New Med Prio item",
    priority: "medium",
    dueDate: "2026-12-01"
},{
    title: "New Low Prio item",
    priority: "low",
    dueDate: "2026-12-01"
},{
    title: "New Work category item",
    category: "Work",
    dueDate: "2026-12-01"
},{
    title: "New Personal category item",
    category: "Personal",
    dueDate: "2026-12-01"
},{
    title: "New Shopping category item",
    category: "Shopping",
    dueDate: "2026-12-01"
},{
    title: "New Health category item",
    category: "Health",
    dueDate: "2026-12-01"
},{
    title: "New Other category item",
    category: "Other",
    dueDate: "2026-12-01"
},{
    title: "New overdue item",
    dueDate: "2026-01-01" // find a way to use today's date and substract a day
}];


test.describe('Todo app', () => {
    test('welcome overlay visible then disappears', async ({toDo}) => {
        await expect(toDo.welcome).toBeVisible();
        await toDo.waitForPageLoad();
        await expect(toDo.welcome).toBeHidden();  
    })
    test('@smoke - added todo item shown on list', async ({readyToDo}) => {
        await readyToDo.addNewTask({
            title:'New Item',
            description:'New Item Description',
            priority:'high',
            category:'Health',
            dueDate:'2026-12-01',
            notes:'New item additional notes'
        });
        await expect(readyToDo.page.getByText('New Item')).toBeVisible();
    })
    test('@smoke - complete task', async ({readyToDo}) => {
        await readyToDo.addNewTask({
            title: 'Item to complete',
            dueDate:'2026-12-02'
        })
        const todoCard = await readyToDo.getToDoCardByTitle('Item to complete');
        await expect(todoCard.title).toHaveText('Item to complete');
        await todoCard.completeTask();
        await expect(todoCard.item).toHaveClass(/completed/);
        
    })
    for (const ti of todoItems){
        test(`@regression - add ${ti.title}`, async ({readyToDo}) => {
            await readyToDo.addNewTask(ti);
            const todoCard = await readyToDo.getToDoCardByTitle(ti.title);
            await expect(todoCard.title).toHaveText(ti.title);
            if (ti.category) await expect(todoCard.category).toHaveText(ti.category);
            if (ti.priority) await expect(todoCard.priority).toHaveText(ti.priority);
            if (ti.dueDate) await expect(todoCard.dueDate).toHaveText(`Due ${ti.dueDate}`);
        })
    }
    test('@regression - title is required ', async ({readyToDo}) => {
        const initialCount = await readyToDo.getItemCount();
        const newTask = await readyToDo.addNewTask({
            title: '',
            dueDate: '2026-12-02'
        })
        await expect(newTask.titleError).toBeVisible();
        await expect(newTask.titleError).toHaveText('Title is required');
        await newTask.closeModal();
        await expect(readyToDo.list.getByRole('listitem')).toHaveCount(initialCount);
    })
    test('@regression - due date is required', async ({readyToDo}) => {
        const initialCount = await readyToDo.getItemCount();
        const newTask = await readyToDo.addNewTask({
            title: 'Incomplete due date',
            dueDate: ''
        })
        await expect(newTask.dueDateError).toBeVisible();
        await expect(newTask.dueDateError).toHaveText('Due date is required');
        await newTask.closeModal();
        await expect(readyToDo.list.getByRole('listitem')).toHaveCount(initialCount);
    })

    
})
