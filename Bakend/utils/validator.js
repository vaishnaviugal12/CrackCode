import validator from 'validator';
 

export const validate = (data)=>{
  const mandatoryfields = ['firstName', 'emailId' , 'password'];
  const isAllowed = mandatoryfields.every((k)=>Object.keys(data).includes(k));
  if(!isAllowed)
    throw new Error("some field missing");

  if(!validator.isEmail(data.emailId))
    throw new Error("Invalid Email");
  
 if(!validator.isStrongPassword(data.password))
    throw new Error("Week Password");
 }


