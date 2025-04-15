var jsPsych = initJsPsych(
    // {on_finish: () => {jsPsych.data.displayData()
    // }}
);

var timeline = [];

var preload = {
    type: jsPsychPreload,
    images: ['img/blue.png', 'img/orange.png']
};

timeline.push(preload)

var welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "Welcome to the experiment. Press any key to begin."
};

timeline.push(welcome)

var instructions = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <p>In this experiment, a circle will appear in the center 
    of the screen.</p>
    <p>If the circle is <strong>blue</strong>, press the letter F on the keyboard as fast as you can.</p>
    <p>If the circle is <strong>orange</strong>, press the letter J 
    as fast as you can.</p>
    <div style='width: 700px;'>
        <div style='float: left;'>
            <img src='img/blue.png'></img>
            <p class='small'><strong>Press the F key</strong></p>
        </div>
        <div style='float: right;'>
            <img src='img/orange.png'></img>
            <p class='small'><strong>Press the J key</strong></p>
        </div>
    </div>
    <p>Press any key to begin.</p>
    `,
    post_trial_gap: 2000
};

timeline.push(instructions)

// var blue_trial = {
//     type: jsPsychImageKeyboardResponse,
//     stimulus: 'img/blue.png',
//     choices: ['f', 'j']
//   };
  
//   var orange_trial = {
//     type: jsPsychImageKeyboardResponse,
//     stimulus: 'img/orange.png',
//     choices: ['f', 'j']
//   };

// timeline.push(blue_trial, orange_trial)

var test_stimuli = [
    { stimulus: "img/blue.png", correct_response: 'f'},
    { stimulus: "img/orange.png", correct_response: 'j'}
];

var fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<div style="font-size:60px;">+</div>`,
    choices: "NO_KEYS",
    trial_duration: () => {return jsPsych.randomization.sampleWithoutReplacement([250, 500, 750, 1000, 1250, 1500, 1750, 2000], 1)[0]},
    data: {
        task: 'fixation'
    }
};

var test = {
    type: jsPsychImageKeyboardResponse,
    stimulus: jsPsych.timelineVariable('stimulus'),
    choices: ['f', 'j'],
    data: {
        task: 'response',
        correct_response: jsPsych.timelineVariable('correct_response')
    },
    on_finish: (data) => {
        data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response)
    }
};

var test_procedure = {
    timeline: [fixation, test],
    timeline_variables: test_stimuli,
    randomize_order: true,
    repetitions: 5
};

timeline.push(test_procedure)

var debrief_block = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => {
        var trials = jsPsych.data.get().filter({task: 'response'});
        var correct_trials = trials.filter({correct: true});
        var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
        var rt = Math.round(correct_trials.select('rt').mean());

        return `<p>You responded correctly on ${accuracy}% of the trials.</p>
        <p>Your average response time was ${rt}ms.</p>
        <p>Press any key to complete the experiment. Thank you!</p>
        `;
    }
};

timeline.push(debrief_block)


jsPsych.run(timeline, {
    on_finish: function() {
      fetch('https://script.google.com/macros/s/AKfycbx_ROqOJGgNHR2NsfOrzXuvzMqJNCAr3YFwvslVfjGRWV-y7yATJ4OcGpg2Fb8U4jfP/exec', {
        method: 'POST',
        body: JSON.stringify({
          participant_id: 'user_123',  // dynamically set this
          jspsych_data: jsPsych.data.get().values()
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        console.log('Data sent to Google Sheets');
      }).catch(err => {
        console.error('Error sending data:', err);
      });
    }
  });
