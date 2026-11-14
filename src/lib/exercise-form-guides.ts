type FormGuide = {
  setup: string;
  movement: string;
  commonMistake: string;
};

const guides = {
  inclinePress: {
    setup: "Use a low incline. Plant both feet and bring the dumbbells beside your upper chest with wrists stacked over elbows.",
    movement: "Press the dumbbells up and slightly inward. Lower slowly until you reach a comfortable stretch.",
    commonMistake: "Letting your elbows flare or letting the dumbbells drift behind the shoulders.",
  },
  highCableFly: {
    setup: "Set the pulleys high and take a staggered stance. Start with your arms wide and a soft bend at each elbow.",
    movement: "Sweep both hands down and inward in an arc. Return slowly until your chest has a comfortable stretch.",
    commonMistake: "Using body weight to pull the handles down or bending the elbows to turn it into a press.",
  },
  legPress: {
    setup: "Set the safeties and the seat so your lower back and hips stay on the pad. Place your working foot or feet flat on the platform.",
    movement: "Lower the platform with your knees following your toes. Press it away through your whole foot.",
    commonMistake: "Lowering far enough for your pelvis to roll or lifting your heels as you press.",
  },
  lyingCurl: {
    setup: "Line your knees up with the machine pivot. Set the roller above the heels and keep your hips on the pad.",
    movement: "Bend your knees to draw the roller toward you, then slowly straighten them.",
    commonMistake: "Lifting your hips or arching your back to finish the rep.",
  },
  lunge: {
    setup: "Start tall with your feet about hip-width apart. Step forward far enough to keep the front foot fully planted.",
    movement: "Bend both knees to lower under control. Push through the front foot and step into the next rep.",
    commonMistake: "Stepping on a tightrope or letting the front knee collapse inward.",
  },
  calf: {
    setup: "Set the balls of your feet securely on the edge of the platform. Keep the same knee angle throughout.",
    movement: "Lower your heels through a comfortable range. Push through the balls of your feet and pause briefly at the top.",
    commonMistake: "Bouncing out of the bottom or using your knees to move the load.",
  },
  squat: {
    setup: "Set the machine safeties. Place both feet flat on the platform with your shoulders and back against the pads.",
    movement: "Bend your hips and knees together, letting your knees follow your toes. Drive up through your whole foot.",
    commonMistake: "Chasing depth after your heels lift or your pelvis rolls off the pad.",
  },
  splitSquat: {
    setup: "Place your rear foot on a low bench and leave enough room ahead for the front foot. Hold a stable support if needed.",
    movement: "Lower by bending the front knee and hip. Keep the front foot flat and use it to stand back up.",
    commonMistake: "Pushing hard through the rear foot or drifting inward over the front knee.",
  },
  extension: {
    setup: "Adjust the backrest so your knees line up with the pivot. Place the pad just above your ankles.",
    movement: "Straighten your knees smoothly, pause briefly, then lower the pad under control.",
    commonMistake: "Kicking the pad up or letting the stack drop between reps.",
  },
  seatedCurl: {
    setup: "Align your knees with the pivot, set the thigh pad snugly, and position the roller above your heels.",
    movement: "Curl your heels down and back without moving your thighs. Return slowly to the start.",
    commonMistake: "Scooting forward or lifting your thighs as the load gets heavy.",
  },
  abduction: {
    setup: "Sit with your back supported and the pads outside your knees. Start at a comfortable width.",
    movement: "Press your thighs outward, pause, then bring them back together slowly.",
    commonMistake: "Rocking your torso or letting the pads snap back.",
  },
  adduction: {
    setup: "Set the pads against the inside of your thighs. Pick a starting width you can control.",
    movement: "Bring your thighs together smoothly, then slowly let the pads move apart.",
    commonMistake: "Forcing a deep stretch or using your hands to move the pads.",
  },
  preacher: {
    setup: "Adjust the seat so the backs of your upper arms rest on the pad. Take a grip that keeps your wrists straight.",
    movement: "Bend your elbows to curl, then lower slowly through a range you can control.",
    commonMistake: "Lifting the upper arms off the pad or dropping into the bottom.",
  },
  chestPress: {
    setup: "Adjust the seat so the handles start around mid-chest. Plant your feet and keep your back against the pad.",
    movement: "Press forward with your wrists in line with your forearms, then return slowly to a comfortable stretch.",
    commonMistake: "Flaring your elbows straight out or rolling your shoulders forward at the bottom.",
  },
  row: {
    setup: "Set the chest pad or seat so you can reach the handles with a long spine and relaxed shoulders.",
    movement: "Pull your elbows back toward your ribs. Pause briefly, then reach forward under control.",
    commonMistake: "Jerking your torso back or shrugging to move the load.",
  },
  pulldown: {
    setup: "Secure your thighs under the pad. Take the programmed grip and sit tall with a slight lean back.",
    movement: "Drive your elbows down until the handle approaches your upper chest, then let your arms rise slowly.",
    commonMistake: "Swinging back or pulling the handle behind your neck.",
  },
  shoulderPress: {
    setup: "Set the handles around shoulder height. Support your back and keep your ribs over your pelvis.",
    movement: "Press up smoothly with your forearms under the handles. Lower to a comfortable depth.",
    commonMistake: "Arching your lower back or bouncing the handles at the bottom.",
  },
  fly: {
    setup: "Set the seat so your hands or elbows line up around chest height. Keep a small bend in your elbows.",
    movement: "Bring your arms together in an arc. Return slowly while maintaining roughly the same elbow angle.",
    commonMistake: "Letting the handles pull your shoulders behind a comfortable range.",
  },
  reverseDeck: {
    setup: "Face the chest pad, set the handles around shoulder height, and keep your elbows slightly bent.",
    movement: "Sweep your arms out and back until they are roughly in line with your torso, then return smoothly.",
    commonMistake: "Shrugging or leaning away from the pad to finish the rep.",
  },
  overheadExtension: {
    setup: "Face away from the pulley with a stable stance. Bring your hands behind your head and keep your ribs down.",
    movement: "Keep your upper arms steady as you straighten your elbows. Bend them slowly to return.",
    commonMistake: "Arching your back or moving your upper arms with the cable.",
  },
  lateralRaise: {
    setup: "Start with the cable low, the handle by your side, and a slight bend in your elbow.",
    movement: "Lift your arm out and slightly forward. Stop around shoulder height or sooner if needed, then lower slowly.",
    commonMistake: "Shrugging or swinging your torso to start the lift.",
  },
  raise: {
    setup: "Choose a light load. Start with your elbows slightly bent. On a machine, adjust the seat so the pads rest against your upper arms.",
    movement: "Raise your arms out and slightly forward to a comfortable height, then lower under control.",
    commonMistake: "Using momentum or shrugging the shoulders as the arms rise.",
  },
  rearFly: {
    setup: "Support your chest or hinge at the hips with a steady torso. Start with a slight bend in the elbows.",
    movement: "Sweep your arms out to the sides, then slowly lower without opening or closing the elbow angle.",
    commonMistake: "Throwing your torso upward or pulling the elbows in as if rowing.",
  },
  facePull: {
    setup: "Set a rope attachment around eye height and stand far enough back to take up the cable slack.",
    movement: "Pull the rope toward your face, letting your hands separate beside your temples. Return slowly.",
    commonMistake: "Leaning back or shrugging to pull the weight.",
  },
  bayesianCurl: {
    setup: "Face away from a low cable with the working arm slightly behind you. Step forward enough to keep tension.",
    movement: "Keep your upper arm steady and curl by bending your elbow. Uncurl slowly.",
    commonMistake: "Letting your elbow swing forward or leaning back to finish.",
  },
  curl: {
    setup: "Stand tall with your elbows close to your sides and wrists in line with your forearms. Use a neutral grip for hammer curls.",
    movement: "Bend your elbows to curl the load, then return slowly to the start.",
    commonMistake: "Swinging the hips or lifting the elbows to get the last few inches.",
  },
  skullCrusher: {
    setup: "Lie supported on a bench and start light. Hold the weight above your shoulders with a secure grip.",
    movement: "Bend your elbows to lower the weight toward a comfortable position near or behind your head, then extend them smoothly.",
    commonMistake: "Letting the elbows flare or dropping the load at the bottom.",
  },
  plank: {
    setup: "Place your elbows under your shoulders. Support yourself on your forearms and toes or knees.",
    movement: "Keep your ribs and hips level as you breathe normally. End the hold when you can no longer keep that position.",
    commonMistake: "Letting your lower back sag or holding your breath.",
  },
  kneeRaise: {
    setup: "Use a secure grip and begin from a steady hang. Set your shoulders comfortably before the first rep.",
    movement: "Lift the knees by curling your pelvis slightly up. Lower slowly and settle before repeating.",
    commonMistake: "Swinging the legs to start the movement.",
  },
  cableCrunch: {
    setup: "Kneel facing a high pulley and hold the rope close to your head with space to move.",
    movement: "Curl your rib cage toward your pelvis within a comfortable range, then slowly return.",
    commonMistake: "Moving the rope with your arms or sitting back at the hips to lift the stack.",
  },
  carry: {
    setup: "Choose two manageable weights and clear the path before lifting them. Stand tall with your arms at your sides.",
    movement: "Walk in controlled, even steps and set the weights down gently.",
    commonMistake: "Rushing, leaning to one side, or shrugging your shoulders throughout the walk.",
  },
  reverseCurl: {
    setup: "Hold the EZ bar with palms down and wrists in line with your forearms. Keep your elbows near your sides.",
    movement: "Curl smoothly and lower slowly. Use a weight you can control without moving your upper arms.",
    commonMistake: "Bending the wrists back, swinging, or leaning to lift the bar.",
  },
  machineCrunch: {
    setup: "Adjust the seat and pads as shown on the machine. Choose a light weight and a comfortable start position.",
    movement: "Exhale and bring your ribs towards your pelvis. Control the return and keep your neck relaxed.",
    commonMistake: "Pulling with your arms, bouncing the stack, or forcing the end of the range.",
  },
  rotaryTorso: {
    setup: "Follow the machine placard to secure your knees or chest. Set a small starting angle and select a light load.",
    movement: "Turn smoothly within a comfortable range. Return with control and match the reps on both sides.",
    commonMistake: "Using momentum or forcing a twist through discomfort.",
  },
  hipThrust: {
    setup: "Set the machine pad across your hip crease. Plant your feet so your shins are roughly vertical near the top.",
    movement: "Drive through both feet and extend your hips. Pause briefly at the top, then lower with control.",
    commonMistake: "Arching your lower back to lift higher after your hips have finished moving.",
  },
  backExtension: {
    setup: "Set the top of the pad just below the hip crease. Secure your feet and start with your head in line with your torso.",
    movement: "Hinge at your hips and lower to a comfortable depth. Return until your torso and legs line up.",
    commonMistake: "Arching past a straight body line at the top.",
  },
  pressdown: {
    setup: "Set the pulley high. Hold the bar or rope with elbows at your sides and wrists in line with your forearms.",
    movement: "Straighten your elbows to press down, then let the attachment rise slowly while keeping your upper arms still.",
    commonMistake: "Leaning onto the cable or bobbing your shoulders to shift the load.",
  },
  reverseCable: {
    setup: "Face the pulleys and take the opposite cable in each hand. Start with your arms in front and elbows slightly bent.",
    movement: "Sweep your arms out to the sides. Keep the same elbow angle as you return under control.",
    commonMistake: "Turning the movement into a row or shrugging as you open your arms.",
  },
  cablePress: {
    setup: "Set both pulleys near chest height. Step forward into a stable stance and start with the handles beside your chest.",
    movement: "Press the handles forward, keeping your torso steady. Return smoothly to a comfortable depth.",
    commonMistake: "Lunging forward or arching your back to finish the press.",
  },
  highToLowCablePress: {
    setup: "Set both pulleys above shoulder height. Use a steady split stance or a supported bench. Start with the handles beside your upper chest and wrists in line with your forearms.",
    movement: "Straighten your elbows to press forward and down. Finish with your hands in front of your lower chest, then return with control.",
    commonMistake: "Losing your stance or keeping your elbows fixed throughout, which turns the press into a fly.",
  },
} satisfies Record<string, FormGuide>;

const aliases: Record<string, keyof typeof guides> = {
  "incline dumbbell press": "inclinePress",
  "high-to-low cable fly": "highCableFly",
  "leg press": "legPress",
  "single-leg leg press": "legPress",
  "lying leg curl": "lyingCurl",
  "walking lunges": "lunge",
  "seated straight-leg calf machine or leg press calf press": "calf",
  "seated straight-leg calf machine": "calf",
  "leg press calf press": "calf",
  "seated bent-leg calf raise": "calf",
  "seated calf raise": "calf",
  "seated dumbbell calf raise": "calf",
  "pendulum squat": "squat",
  "supported stationary bulgarian split squat": "splitSquat",
  "bulgarian split squat": "splitSquat",
  "seated leg extension": "extension",
  "leg extension": "extension",
  "seated leg curl": "seatedCurl",
  "leg curl": "seatedCurl",
  "hip abduction machine": "abduction",
  "hip adduction machine": "adduction",
  "seated machine preacher curl": "preacher",
  "machine chest press": "chestPress",
  "chest machine press": "chestPress",
  "seated chest-supported machine row": "row",
  "chest-supported row or seated cable row": "row",
  "chest-supported row": "row",
  "chest-supported t-bar row": "row",
  "seated cable row": "row",
  "machine row": "row",
  "lat pulldown": "pulldown",
  "neutral-grip lat pulldown": "pulldown",
  "wide-grip lat pulldown": "pulldown",
  "close-grip lat pulldown": "pulldown",
  "seated machine shoulder press": "shoulderPress",
  "seated machine chest fly": "fly",
  "chest fly": "fly",
  "single-arm pec deck": "fly",
  "reverse pec deck / seated machine reverse fly": "reverseDeck",
  "reverse pec deck": "reverseDeck",
  "two-arm reverse pec deck": "reverseDeck",
  "overhead cable triceps extension": "overheadExtension",
  "cable lateral raise": "lateralRaise",
  "machine lateral raise": "raise",
  "lateral raise": "raise",
  "rear delt fly": "rearFly",
  "face pull": "facePull",
  "face-away bayesian cable curl": "bayesianCurl",
  "barbell curl": "curl",
  "hammer curl": "curl",
  "cable curl": "curl",
  "skull crusher": "skullCrusher",
  "plank": "plank",
  "hanging knee raise": "kneeRaise",
  "cable crunch": "cableCrunch",
  "abdominal crunch machine": "machineCrunch",
  "rotary torso machine": "rotaryTorso",
  "machine hip thrust": "hipThrust",
  "farmer's carry": "carry",
  "kettlebell farmer walk": "carry",
  "reverse ez-bar curl": "reverseCurl",
  "back extension — hyperextension bench": "backExtension",
  "back extension machine": "backExtension",
  "triceps pressdown, bar": "pressdown",
  "triceps pushdown": "pressdown",
  "rope triceps pressdown": "pressdown",
  "reverse cable crossover": "reverseCable",
  "cable chest press": "cablePress",
  "high-to-low cable chest press": "highToLowCablePress",
};

export function getExerciseFormGuide(name: string): FormGuide | undefined {
  const label = name.toLowerCase().trim().replace(/^[a-z]\d+\s+/, "")
    .replace(/\s*(?:— (?:easy primer|working sets)|\(warm-up\))$/, "");
  return Object.hasOwn(aliases, label) ? guides[aliases[label]] : undefined;
}
