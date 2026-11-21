# Project prompts

User prompts are recorded verbatim below, in conversation order.

## Prompt 1: Establish Game Project

We're going to write a digital board game implementation of "Nuns on The Run" targeting phones, tablets, laptops, and a tabletop game system which is like a giant 55" tablet that the palyers sit around with private info on their phones. Write a README.md and a VISION.md describing this project. Review ../hanami, ../pantheon, ../cantstop, ../istanbul for how they're implemented. We're going to follow a similar implementation plan. Find and summarize the rules for the game, and build a component gallery for us to review the art direction. let's get two different art styles for the game components, run a dev server for us to review them.

## Prompt 2: Rework Visual Design

this is crap. review ../gaiaproject/UX_DESIGN_PRINCIPLES.md
../istanbul/UX_DESIGN_PRINCIPLES.md
../supermega/UX_DESIGN_PRINCIPLES.md
../vianova/UX_DESIGN_PRINCIPLES.md
 and ../gaiaproject/VISUAL_DESIGN.md
../istanbul/VISUAL_DESIGN.md
../supermega/VISUAL_DESIGN.md
../vianova/VISUAL_DESIGN.md
for how to properly design and try again with imagegen

## Prompt 3: Match Original Board

OK we've compared the styles and we like "Moonlit Storybook". Discard the other one entirely. The game board is not even close to the correct track, find a reference and build the artwork to match all the constraints of the original (same numbers in teh same rooms and same connectivity/visibility/audibility).  coloured routes, locks, coloured locations, are all important to gameplay.

## Prompt 4: Reveal Patrol Routes

this looks mich closer, teh coloured patrol paths aren't visible? the edges shoudl show the patrol routes

## Prompt 5: Improve Component Cards

OK more problems: the novice cards all have the same image. tehere should be an appropriate image per movement type. The selected checkmark should be a graphical asset in a corner of the card not a super-ugly piece of markup. the titles on the novice cards aren't registered with the well for them. secret wish's title is too large for its well. text on that card is also too small. blessing ditto. title for patrol cards doesn't fit, could use a minimap instead of artwork. maybe get the die from teh dice in ../cantstop or ../istanbul.

## Prompt 6: Establish Prompt Discipline

I forgot to set up promtp discipline for this project. I want to write PROMPTS.md which contain my prompts verbatim. look at ../deepsea for an example; add rules about updating PROMPTS.md in an append-only way to AGENTS.md. It is OK to include a 2-4 word summary of hte prompt in the heading but hte prompt itself must be what i typed VERBATIM, typos and all

## Prompt 7: Build Animation Lab

This is looking great. Now let's make an animation lab so that we can approve the interaction at all form factors. You can refer to the lab in ../hanami as an example, except that it is *critically important* that all used components are the production svelte components and enver mockups or fakes; the gaol is to know that the end product will behave just like it does in the animation lab once we've approved all the interactions. we want to check phone in both orientations, tablet, laptop, and tabletop animations. Put that up as a dev server for us to review.

## Prompt 8: Refine Direct Manipulation

abbess token is too large for the board, she covers two spaces. her direction arrow is really hard to read/too tiny - it should be obvious what direction she is going. teh UI should be overlaid on teh board - for example move abbess indicators should be on the map not separate buttons, in general prefer direct manipulation. in general it looks like maybe you've shown debug controls rather than player facing controls in teh actual UI. tabletop UI should not require scrolling, and the game should not speak to implementation decisions ("viewing from the south edge"? who has control over that? teh player stands where they choose). let's take another pass, minimize scrolling, maximize direct manipulation

## Prompt 9: Publish GitHub Preview

We need to switch how we're reviewing this project--let's make a GPLv3 public repo on github, and publish the animation lab on gh pages. The existing history can be the first PR on the github repo with a deployment at anicolao.github.io/nuns/pr1

## Prompt 10: Repository Review

review this repository and suggest next steps

## Prompt 11: Movement Selection

In the "choose movement" animation, please move the checkmark to the bottom right of the card to make it more visible against the bright background. Also in the same animation, only animate the newly selected card and not the previous selection.

## Prompt 12: Publish Movement Update

Is it pushed to the PR for review? I do not see it in the lab

## Prompt 13: Capture Presentation

In the "caught and return" animation, why do we see only the bottom half of a card? We are also not sure why this is a player choice, because the player doesn't get to choose if they are caught

## Prompt 14: Restore Working Preview

why would you think that that is OK? We changed nothing, we expect the preview to work

## Prompt 15: Gameplay Lab Scenarios

The animation lab is missing several scenarios that prevent us from understanding what the game would look like: the UI for controlling novices, the guards hearing noises or seeing novices, catching a novice, and using a blessing that involves map interaction (such as false noise)

## Prompt 16: Build Full Firebase Game

first off, the novice movement was supposed to re-use the choose movement animation lab where we pick among the cards. so I am worried that hte animation lab isn't really built out of the production components/is a bunch of fakery rather than a real walkthrough of production ready UI components. Nonetheless, let's proceed to creating the full game based on the animation lab work so far. Refer to github.com/anicolao/istanbul github.com/anicolao/hanami and github.com/anicolao/roborally for examples of how we want to build event sourced games, and do this one the same way, backed by firebase realtime database with anonymous auth. you'll need to use the firebase cli and get authenticated as anicolao to create the project and set up anonymous auth, and use a nix flake  or npm as necessary to install any missing tools/software.

## Prompt 17: Gameplay Review Improvements

This is great, but there are some improvements to make. The "join game" screen needs an option to scroll down - by default on laptops, the bottom part, including the "join" button, is inaccessible. In the "join game" screen, if "novice" is the only valid option, it needs to be pre-selected. While a guard player is choosing routes, the prompt on the novice screen should say "Waiting for guards to choose routes". On the novice screen, the label on the "view blessing" button should prepend "Blessing:" before its name for clarity, similar to how it does for the wish. In the "secret wish" popup, the text on the card is misaligned (appears all over the card) - it must fit into the blank bottom half of the card. In the same popup, the image must represent the specific wish, e.g. the image for "Letter from lover" should display a letter and not a potion bottle. In popups such as "Secret Wish" and "Blessing", clicking anywhere on the background (outside the card and buttons) should close the view. The zoom buttons must stay in the same place on the screen when activated; the user should not need to move their mouse to zoom in/out consecutively multiple times. After guards choose their routes, they should be displayed to all novices, including in the game log; they are public information. While making their very first turn in the game specifically, novices should be allowed to undo it, since no new information can be revealed by their movement. When a novice is selecting the movement speed for the first turn specifically, there should be a warning on screen that novice move twice on the first turn, using the same speed card for both times. The guards should be able to see which movement card each novice used and it should be recorded in the log; this is public information. Once a novice is caught and walks back to her cell, she can resume free movement the moment she goes out of sight of a guard FROM HER CURRENT LCOATION; she is NOT teleported back to her cell immediately. Add a toggleable option to view either the visibility blocking objects on the map and the locations each guard can currently see. Make the guards visually distinct by using a white background for one of their characters and keeping the dark background for the other, and display the same images next to the "abbess" amd "prioress" text on buttons in the guards' UI for clarity. Please make all those improvements and put up a new version so that they can be tested
