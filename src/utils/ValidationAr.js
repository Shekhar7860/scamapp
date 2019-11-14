class ValidationClass{

	errors= [];

	validate = (data) => {

		this.errors= [];

		for(let item of data){

			let {field, name, rules}= item;

			// field= field.trim();

			rules= rules.split('|');

			for(let rule of rules){

				rule= rule.trim();
				validationRules= rule.split(':');

				this.validateData(field, name, validationRules[0], validationRules[1]);
			}
		}

	  	return this.errors;
	}

	messages = (attribute, rule, ruleData) => {

		switch (rule) {
		    case 'required':
		        return `الـ ${attribute} مطلوب`
		        break;
		    case 'email':
		        return `${attribute} يجب أن يكون البريد إلكتروني صالح.`
		        break;
		    case 'alpha':
		        return `الـ ${attribute} يجب أن تتكون من الأحرف الأبجدية فقط.`
		        break;
		    case 'max':
		        return `الـ ${attribute} قد لايكون أكبر من ${ruleData} حروف `
		        break;
		    case 'min':
		        return `الـ ${attribute} لا بد أن يكون على الأقل ${ruleData} حروف `
		        break;
		    case 'numeric':
		        return `الـ ${attribute}يجب أن يتكون فقط من أحرف رقمية.`
		        break;
		    case 'no_space':
		        return `الـ ${attribute} لا ينبغي أن يكون هناك أي فراغ بينهما.`
		        break;
		    default:
						return `حدث خطأ`
						break;
		}

	}



	validateData= (field, name, rule, ruleData) => {

		switch (rule) {
		    case 'required':
		        this.fieldIsRequired(field, name, rule);
		        break;
		    case 'email':
		        this.fieldIsEmail(field, name, rule);
		        break;
		    case 'alpha':
		        this.fieldIsAlpha(field, name, rule);
		        break;
		    case 'max':
		        this.fieldMax(field, name, rule, ruleData);
		        break;
		    case 'min':
		        this.fieldMin(field, name, rule, ruleData);
		        break;
		    case 'numeric':
		        this.isNumeric(field, name, rule);
		        break;
		    case 'no_space':
		        this.noSpace(field, name, rule);
		        break;
		    default:
        		break;
		}
	}

	fieldIsRequired = (field, name, rule) => {

		if(!field)
			this.errors.push(this.messages(name, rule));

	}

	fieldIsEmail= (field, name, rule) => {

		let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    	if(! regex.test(field))
    		this.errors.push(this.messages(name, rule));

	}

	fieldIsAlpha= (field, name, rule) => {

		let regex = /^$|^[a-zA-Z ]+$/;

    	if(! regex.test(field))
    		this.errors.push(this.messages(name, rule));

	}

	fieldMax= (field, name, rule, ruleData) => {

		if(field.length > parseInt(ruleData) )
			this.errors.push(this.messages(name, rule, ruleData));

	}

	fieldMin= (field, name, rule, ruleData) => {

		if(field.length < parseInt(ruleData) )
			this.errors.push(this.messages(name, rule, ruleData));
	}

	isNumeric= (field, name, rule) => {

		let isNumeric= !isNaN(parseFloat(field)) && isFinite(field);

		if(!isNumeric)
			this.errors.push(this.messages(name, rule));
	}

	noSpace= (field, name, rule) => {

		let regex = /^$|^[^\s]+$/;

    	if(! regex.test(field))
    		this.errors.push(this.messages(name, rule));
	}

}

export default ValidationAr= new ValidationClass();
