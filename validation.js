//List of validation rules
const rules = [
    {
        test: (obj) => obj.title.length > 2,
        message: "Object title is short"
    },
    {
        test: (obj) => obj.title.length < 201,
        message: "Object title is long. Limit 200"
    },
    {
        test: (obj) => obj.description.length < 1001,
        message: "Object description limit 1000"
    },
    {
        test: (obj) => Array.isArray(obj.photo_links),
        message: "photo_links is not array"
    },
    {
        test: (obj) => obj.photo_links.length < 4,
        message: "Photo links limit 3"
    }
]

//Initial state
let validation_state = {
    status: false,
    message: ""
}

//Validation steps start
function validation(obj){
    validation_state.status = false
    validation_state.message = ""
    step1(obj);
    return validation_state;
}

//First validation step
function step1 (obj) {

    //Basic object field validation
    if(Object.keys(obj).length == 4){
        if('title' in obj && 'description' in obj && 'photo_links' in obj && 'price' in obj){
            //start step 2
            step2(obj);
        }
        else{
            console.log('Invalid keys in object');
            validation_state.status = false;
            validation_state.message = 'Invalid keys in object';
        }
    }
    else {
        console.log('Wrong number of properties');
        validation_state.status = false;
        validation_state.message = 'Wrong number of properties';
    }
}

//Second validation step
function step2(obj){
    
    //Checking against a list of rules
    const errors = rules.reduce((errs, rule) => {
        const result = rule.test(obj);
        if (result === false) {
          errs.push(rule.message);
        }
        return errs;
      }, []);
      
      //Response formation
      const isValid = errors.length === 0;

      if(isValid){
          console.log('object is valid');
          validation_state.status = true;
          validation_state.message = "Validation is complete";
      }
      else {
          console.log('object dont valid');
          console.log(`errors ${errors}`);
          validation_state.status = false;
          validation_state.message = `Dont valid! Errors ${errors}`;
      }
      //
}

module.exports = validation;