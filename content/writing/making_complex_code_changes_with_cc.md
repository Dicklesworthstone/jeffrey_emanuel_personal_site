---
title: "Making Complex Code Changes with Claude Code"
date: "2025-08-16"
excerpt: "Advocates for 'separating cognition' when using agents. Instead of asking for code directly, use agents to generate granular plans first, spreading the reasoning load across more tokens."
category: "Dev Workflow"
author: "Jeffrey Emanuel"
source: "FMD"
---

How should you approach complex changes to already complex software projects when using agentic coding tools such as Claude Code or Cursor?

I'm talking about when you want to make a big change to how something works in your project that would impact many different code files across different functional areas of a project, where you need to proceed very carefully or you risk really making a mess of your codebase and breaking everything in complex, confusing ways.

Perhaps you just realized that you've gone about some important task or process your code handles in a bad way and need to change your fundamental approach of how you handle something, or need to switch to a different library. You might have a long list of problems and limitations of how the existing code works, and a list of how you want the code to work instead in your ideal hypothetical new version (perhaps not specifically how it should be implemented, but the properties or features you'd want it to have).

If the existing implementation of the affected code is long and split across many code files, and if a full understanding of the problem also requires that the model look at some potentially long sample input data files, you might already be using up so much context that the model will quickly get saturated before it even manages to do much new coding for you. And in any case, requesting a detailed understanding of how your existing complicated code works is already a demanding cognitive task.

Figuring out how it SHOULD work to best accomplish all your desired attributes and satsify all the various constraints is a very different and probably much harder cognitive task. And finally, turning that new design into actual code that implements the desired plan correctly and follows best practices without any bugs is yet another, potentially very challenging, cognitive task.

As much as frontier models like Opus4.1 and GPT-5 Thinking are ridiculously smart and extremely good at programming tasks, you will get much, much better results out of them by making things easier for them. And the best way to do that is to separate out those different cognitive steps so that you can "spread out the cognition over far more tokens." What does this mean in practice? The main way to do this is already a well-known technique in agentic coding circles: instead of asking the agent to change the code directly, you first ask it to come up with a highly detailed, granular PLAN document for how it could best go about doing that. Here is an example prompt that I recently used to do this:

> I'm looking through all the __ related code and realizing that we've followed an incredibly stupid approach to parsing the raw downloaded original files and parsing/converting them into a clever, versatile JSON format that is optimized for analytical tasks and for ingestion into SQLite using SQLite's built-in JSONB column type functionality (see `third_party_library_docs/sqlite_json_distilled_docs.md` for more info on this).
>
> For example, take `/data/SAMPLE_INPUT_FILE.txt`
>
> We converted this into the utterly useless/pointless JSON file:
> `/data/SAMPLE_CONVERTED_FILE.json`
>  
> (actually fully load up and read both of these files to understand). There are countless other examples like that you can see.
>
>
> We are including in what is supposed to be our optimized, canonical JSON representation so much utterly useless nonsense information like the name of specific fonts and a bunch of other worthless presentation-related metadata. What we REALLY want is a smart, structured schema for representing the data in a way that easily lends itself to aggregation and views. 
>
>
> I want you to review ALL this code and then figure out what we are doing wrong. You might want to search the web to famliarize yourself with the official ___ schemas for ___ documents. Then I want you, after super carefully thinking everything over, to propose a FAR SUPERIOR revised system for converting all the raw input files (which we fortunately already have saved locally in `/data/sample_files`) into actually intelligently structured and useful JSON file representations, which you should detail in extreme specifics and granularity and comprehensiveness as `PLAN_TO_IMPROVE_INPUT_FILE_PROCESSING__OPUS.md`

You probably noticed that the specified plan file name contains "OPUS" at the end; this was the prompt I gave to Claude Code. In addition to that, I also gave the same instructions to GPT-5 Thinking in Cursor, but changing "OPUS" to "GPT5". So why would you ever want to do that? Isn't that overkill? Why would you want to deal with two different, probably incompatible plans? The reason is that the models can learn a lot from each other by following a sort of LLM dialectical process. You can help them with this by following up with a prompt like this:

> I asked a competing LLM to do the exact same thing and it came up with a pretty different plan which you can read in `PLAN_TO_IMPROVE_INPUT_FILE_PROCESSING__GPT5.md`. I want you to REALLY carefully analyze their plan with an open mind and be intellectually honest about what they did that's better than your plan. Then I want you to come up with the best possible revisions to your plan (you should simply update the existing document file for your original plan with the revisions) that artfully and skillfully blends the "best of both worlds" to create a true, ultimate, superior hybrid version of the plan that best achieves our stated goals and will work the best in real-world practice to solve the problems we are facing.

Obviously, you do the same thing with the other LLM, too, simply changing the filename. Now, even just this step will result in a much better plan than you had from either model to start with. But you can further enhance the plan by doing this for at least one more round, with a prompt like this:

> OK, just as I asked you to compare your plan to the plan written by the competing LLM and to then integrate the best ideas from both plans as revisions to your original plan document, I asked the competing LLM to do the same comparison using YOUR plan, and to also take the best ideas from both and use them to revise ITS original plan! So now we are ready for round 2, where you can both learn from and FURTHER IMPROVE AND REVISE your latest revised plan based on a careful and honest analysis and understanding of the other plan, which you can once again find in the file named `PLAN_TO_IMPROVE_INPUT_FILE_PROCESSING__GPT5.md`.

If you want to keep going like this, you can slightly tweak that prompt as follows for more rounds:

> OK, just as I asked you to compare your revised plan to the revised plan written by the competing LLM and to then integrate the best ideas from both plans as further revisions to your revised plan document, I asked the competing LLM to do the same comparison using YOUR revised plan, and to also take the best ideas from both and use them to revise ITS revised plan! So now we are ready for round 3, where you can both learn from and FURTHER IMPROVE AND REVISE your latest revised plan based on a careful and honest analysis and understanding of the other revised plan, which you can once again find in the file named `PLAN_TO_IMPROVE_INPUT_FILE_PROCESSING__GPT5.md`.

Now you can look through each of the final revised plans and decide which one you think sounds better. But ideally they shouldn't be all that different from each other by this point. Now, you take your final plan that you want to use and start a new session with CC or Cursor, and tell it:

> First, I want you to very carefully read and study ALL of the document `PLAN_TO_IMPROVE_INPUT_FILE_PROCESSING__GPT5.md`, and then also explore and read through the various code files mentioned in the plan to thoroughly understand how the code currently works and how you should revise those code files (and potentially create new code files, although you should primarily focus on revising the existing code files in place wherever feasible); once you are completely sure about the best way to proceed, I want you to execute the entire plan carefully, systematically, and meticulously, with extreme diligence and care. Don't rush! Keep track of all progress you make in executing the plan by notating this information in the plan document itself in a clear, easy-to-understand way, so that another coding agent can easily pick up from where you left off in case you don't finish implementing the entire plan right now.

If you get stuck in the process with one model and agentic coding tool, try switching to the other one, and then revise that last prompt to explain that you already started the process of implementing the plan document, but that the other coding agent got confused and hit a wall, and you need it to figure out how things went off the rails and then complete the full implementation of the plan, using the notes from the last model in the plan document itself about what has already been done. You can also do the same thing if you simply run out of context space before the entire plan is implemented.

One thing you should absolutely avoid at all costs is allowing CC or Cursor to "compact" the conversation by summarizing what has already been said during the session. Instead, start a new session and prompt it in a similar way, telling it to pick up from where it left off as indicated in the notations in the plan document.


Yes, this technique takes a long time to do and a lot of tokens and steps, but it allows you to accomplish very complex things that would otherwise be out of reach of these models/tools. And if you keep these snippets handy in a text editor like I do, it doesn't even take that long (especially because you can be multi-tasking and working on something else while the agents are researching and writing and implementing the plans!).