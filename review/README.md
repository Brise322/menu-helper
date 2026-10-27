<!-- README.md -->
# Menu Helper review materials

The menu images in this folder are synthetic test fixtures, not real restaurants or orders.

The [ChatGPT walkthrough](https://github.com/Brise322/menu-helper/releases/download/v1.1.0/menu-helper-chatgpt-demo.mp4) uses actual browser captures after refreshing the tool definition for `ui://menu-helper/menu-v3.html`. Setup and model waiting time are omitted. English captions describe the observed interaction; the original ChatGPT screen is preserved.

The walkthrough covers optional steak doneness (including no selection and Saignant), a printed required fries-or-salad choice, quantity changes, a local-language waiter card, an add-on card, the bill card, Japanese peanut-allergy wording, and the complete 59-item French menu with category tabs and search. `menu_choices.png` is the additional fixture for required versus optional choices. Allergy wording in the demo is a fictional test scenario.

The submission manifest contains five positive and three negative reviewer scenarios. The Greek and Thai fixtures are available for reviewers; the recorded walkthrough is not a claim that every manifest scenario was run.

The server is unauthenticated and provides one tool, `show_menu`. It returns supplied menu data and inline UI without storing orders, making reservations, processing payments, deleting data or calling external services. The tool's annotations are read-only true, destructive false and open-world false. The browser walkthrough was tested with CSP enforcement enabled for custom apps.

Known limitation: ChatGPT sometimes adds explanatory text after the widget despite the server's concise-response instructions. This does not change the widget's required and optional choice behavior.
