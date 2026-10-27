<!-- README.md -->
# Menu Helper review materials

The menu images are synthetic test fixtures, not real restaurants or orders. The allergy scenario is fictional.

The [ChatGPT walkthrough](https://github.com/Brise322/menu-helper/releases/download/v1.1.0/menu-helper-chatgpt-demo.mp4) now shows menu-v4, tested against deployed source commit `333c7f6`. It contains about 105 seconds of genuine ChatGPT captures with captions outside the original UI. Setup and model waiting are omitted. The existing download URL is retained.

The recording covers cuisine/intro and tappable must-try chips, categories/search, quantity changes, optional steak doneness (no choice and Saignant), a printed required fries-or-salad choice, full-screen cards, add-on ordering, the bill, English widget labels, Japanese peanut-allergy wording, and the observed selective-risk behavior. `menu_choices.png` independently tests printed choices; those choices are not printed on the three-page French fixture.

All five positive and three negative manifest prompts were tested in separate ChatGPT conversations with their original attachments. **Six meet the stated criteria and two are partially nonconforming.** [Full results and original failure wording](test-results.md) include evidence: the Greek test lacks the requested Moussaka analogy and mistranslates the Kokoretsi title; unflagged Japanese dishes still carry allergy caution text. The expected_behavior values have not been relaxed. The video acknowledges the allergy-text issue.

Desktop and 390px narrow web full-screen headings were visible. A physical phone's status bar was not tested. Some model responses still contain longer explanations after the widget. These limits and browser input timeouts encountered during recording are documented in the results.

The server is unauthenticated and provides one tool, `show_menu`. It returns supplied menu data and inline UI without storing orders, making reservations, processing payments, deleting data or calling external services. Its annotations are read-only true, destructive false and open-world false. The browser walkthrough uses CSP enforcement enabled for custom apps.

The three listing screenshots in `plugin/assets/` are actual menu-v4 UI captures at 706 × 800 pixels. The MCP-only ZIP is built with `./build_plugin.sh`. GitHub hosts review materials; this does not indicate OpenAI approval or directory publication. Final policy declarations and Submit for review are reserved for the owner.
