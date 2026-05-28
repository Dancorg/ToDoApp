import { test as base } from '@playwright/test';
import { ToDoPage } from "../pages/ToDoPage";

type PageFixtures = {
    toDo : ToDoPage;
    readyToDo : ToDoPage;

};

export const test = base.extend<PageFixtures>({
    toDo: async ({page}, use) => {
        const toDo = new ToDoPage(page);
        await toDo.goto();
        await use(toDo);
    },
    readyToDo: async ({page}, use) => {
        const toDo = new ToDoPage(page);
        await toDo.goto();
        await toDo.waitForPageLoad();
        await use(toDo);
    }
});

export {expect} from '@playwright/test';