export default {
  common: {
    margin: 2,
    lineWidth: 4,
    fontSize: 16,
    fontFamily: 'arial',
  },

  body: {
    size: {
      minWidth: 160,
      Radius: 4,

      stageWidth: 2,
      stageCircle: 7,

      topPadding: 6,
      leftPadding: 6,
      rightPadding: 6,
      bottomPadding: 6,
    },

    style: {
      Relative: '#409eff',

      stagePredict: '#4159D1',
      stageTrain: '#73767a',
      stageCross_validation: '#b88230',

      // rnutime status: unrun
      Unrun_Body: '#E8E8EF',
      Unrun_Border: '#E8E8EF',
      Unrun_Text: '#6A6C75',

      Unrun_Body_Disable: '#BBBBC8',
      Unrun_Border_Disable: '#BBBBC8',
      Unrun_Text_Disable: '#534C77',

      Unrun_Body_Choose: '#409eff',
      Unrun_Border_Choose: '#409eff',
      Unrun_Text_Choose: '#FFFFFF',

      // runtime status: success
      Success_Body: '#0EC7A5',
      Success_Border: '#0EC7A5',
      Success_Text: '#FFFFFF',

      Success_Body_Disable: '#0EC7A5',
      Success_Border_Disable: '#0EC7A5',
      Success_Text_Disable: '#534C77',

      Success_Body_Choose: '#409eff',
      Success_Border_Choose: '#409eff',
      Success_Text_Choose: '#FFFFFF',

      // runtime status: fail
      Fail_Body: '#FF4F38',
      Fail_Border: '#FF4F38',
      Fail_Text: '#FFFFFF',

      Fail_Body_Disable: '#E8E8EF',
      Fail_Border_Disable: '#E8E8EF',
      Fail_Text_Disable: '#534C77',

      Fail_Body_Choose: '#409eff',
      Fail_Border_Choose: '#409eff',
      Fail_Text_Choose: '#FFFFFF',

      // runtime status: Running
      Running_Body: 'rgba(36,182,139,0.6)',
      Running_Border: '#0EC7A5',
      Running_Text: '#6A6C75',

      Running_Body_Disable: 'rgba(187,187,200,0.6)',
      Running_Border_Disable: 'rgba(187,187,200,0.6)',
      Running_Text_Disable: '#534C77',

      Running_Body_Choose: 'rgba(36,182,139,0.6)',
      Running_Border_Choose: '#409eff',
      Running_Text_Choose: '#6A6C75',
    },
  },

  port: {
    content: {
      width: 14,
      height: 6,
      rx: 2,
    },
    multiply: {
      width: 2,
      height: 2,
      rx: 2,
    },
    style: {
      Data_Port: '#fa9408',
      Cache_Port: '#bcf500',
      Model_Port: '#00cbff',
      Disable_Port: '#7F7D8E',
      Disable_Unrun_Port: '#7F7D8E',
    },
  },

  icon: {
    size: {
      width: 18,
      height: 18,
    },
    color: {
      Success: '#0EC7A5',
      Fail: '#FF4F38'
    }
  },

  suffix: {
    style: {
      color: '#909399',
      clickable: '#409eff'
    },
  },
};
