const smoothScroll = () => {
	const anchors = document.querySelectorAll('a[href*="#"]');

	for (const anchor of anchors) {
		anchor.addEventListener('click', event => {
			event.preventDefault();

			const blockID = anchor.getAttribute('href'),
				idElem = document.querySelector(blockID);
			if (idElem) {
				const idElemY = idElem.offsetTop - 100;
				window.scrollTo({
					top: idElemY,
					behavior: 'smooth'
				});
			}
		});
	}
};
smoothScroll();

const headerBg = () => {
	const header = document.querySelector('.header');
	const calc = document.querySelector('.header-nav__item--second>a');

	if (document.documentElement.scrollTop > 100) {
		header.style.background = '#fff';
		calc.style.color = '#333';
		header.classList.add('header-active');
	} else {
		header.removeAttribute('style');
		calc.removeAttribute('style');
		header.classList.remove('header-active');
	}
};

if (window.innerWidth > 765) window.addEventListener('scroll', headerBg);

const openFormPopup = () => {
	const buttons = document.querySelectorAll('.modal__button');
	const modal = document.querySelector('.modal');

	buttons.forEach(item => {
		item.addEventListener('click', () => {
			modal.classList.add('modal--visible');
		});
	});
};

openFormPopup();

const closeFormPopup = element => {
	const modal = document.querySelector(`.${element}`);
	modal.addEventListener('click', e => {
		const target = e.target;

		if (target.closest(`.${element}__close`) || target === modal) {
			modal.classList.remove(`${element}--visible`);
		}
	});

	document.addEventListener('keyup', e => {
		const target = e.key;

		if (target === 'Escape') modal.classList.remove(`${element}--visible`);
	});
};

closeFormPopup('modal');
closeFormPopup('thanks');

$('form').each(function() {
	$(this).validate({
		errorElement: 'div',
		errorClass: 'invalid',
		rules: {
			userName: {
				required: true,
				minlength: 2,
				maxlength: 15
			},
			userPhone: {
				required: true,
				minlength: 18
			},
			userEmail: {
				required: true,
				email: true
			},
			trading: {
				required: true
			},
			profit: {
				required: true
			},
			broker: {
				required: true
			},
			deposit: {
				required: true
			}
		},
		//сообщения
		messages: {
			userName: {
				required: 'Заполните поле',
				minlength: 'Имя должно быть не короче 2 букв',
				maxlength: 'Имя должно быть не длинее 15 букв'
			},
			userPhone: {
				required: 'Заполните поле',
				minlength: 'Введите полный номер телефона'
			},
			userEmail: {
				required: 'Заполните поле',
				email: 'Введите корректный Email в формате name@domain.com'
			},
			trading: {
				required: 'Заполните поле'
			},
			profit: {
				required: 'Заполните поле'
			},
			broker: {
				required: 'Заполните поле'
			},
			deposit: {
				required: 'Заполните поле'
			}
		},

		submitHandler: function(form) {
			$.ajax({
				type: 'POST',
				url: 'send.php',
				data: $(form).serialize(),
				success: function(response) {
					$(form)[0].reset();
					$('.modal').removeClass('modal--visible');
					$('.thanks').addClass('thanks--visible');
					return true;
				}
			});
		}
	});
});

function maskPhone(selector, masked = '+7 (___) ___-__-__') {
	const elems = document.querySelectorAll(selector);

	function mask(event) {
		const keyCode = event.keyCode;
		const template = masked,
			def = template.replace(/\D/g, ''),
			val = this.value.replace(/\D/g, '');
		let i = 0,
			newValue = template.replace(/[_\d]/g, a => (i < val.length ? val.charAt(i++) || def.charAt(i) : a));
		i = newValue.indexOf('_');
		if (i !== -1) {
			newValue = newValue.slice(0, i);
		}
		let reg = template
			.substr(0, this.value.length)
			.replace(/_+/g, a => '\\d{1,' + a.length + '}')
			.replace(/[+()]/g, '\\$&');
		reg = new RegExp('^' + reg + '$');
		if (!reg.test(this.value) || this.value.length < 5 || (keyCode > 47 && keyCode < 58)) {
			this.value = newValue;
		}
		if (event.type === 'blur' && this.value.length < 5) {
			this.value = '';
		}
	}

	for (const elem of elems) {
		elem.addEventListener('input', mask);
		elem.addEventListener('focus', mask);
		elem.addEventListener('blur', mask);
	}
}

maskPhone('[type="tel"]');

const inputReplace = () => {
	const input = document.querySelector('[type="text"]');

	input.addEventListener('input', () => {
		input.value = input.value.replace(/\d/g, '');
	});
};

inputReplace();

const calc = () => {
	let selectValue = 0;
	const input = document.getElementById('calc'),
		total = document.querySelector('.total'),
		getData = () => fetch('./price.json');

	// кастомный селект
	const customSelect = () => {
		const selectHeader = document.querySelector('.select__header'),
			selectItem = document.querySelectorAll('.select__item'),
			select = document.querySelector('.select');

		const remove = () => {
			select.classList.remove('is-active');
		};

		const selectToggle = () => {
			select.classList.toggle('is-active');
		};

		const selectChoose = event => {
			const target = event.target;

			const text = target.textContent,
				currentText = select.querySelector('.select__current');
			currentText.textContent = text;
			remove();
			getData()
				.then(response => response.json())
				.then(data => {
					addSelectValue(data, text);
				})
				.catch(err => console.log(err));
		};

		selectHeader.addEventListener('click', selectToggle);

		document.addEventListener('click', event => {
			const target = event.target;

			if (!target.closest('.select') && select.classList.contains('is-active')) {
				remove();
			}
		});
		selectItem.forEach(item => {
			item.addEventListener('click', selectChoose);
		});

		input.addEventListener('change', calculation);
	};

	// добавление из data в селект
	const addToSelect = data => {
		const selectBody = document.querySelector('.select__body');

		data.forEach(item => {
			selectBody.insertAdjacentHTML(
				'beforeend',
				`
                <div class="select__item">${item.type}</div>
            `
			);
		});
	};

	const addSelectValue = (data, text) => {
		selectValue = 0;
		data.forEach(item => {
			if (item.type === text) {
				selectValue = item.price;
			}
			if (input.value !== '') {
				calculation();
			}
		});
	};

	getData()
		.then(response => response.json())
		.then(data => {
			addToSelect(data);
			customSelect();
		})
		.catch(err => console.log(err));

	const calculation = () => {
		total.textContent = 0;
		total.textContent = input.value * selectValue;
	};
};

calc();

const moveMenuElemnts = () => {
	const firstElement = document.querySelector('.header-nav'),
		secondElement = document.querySelector('.header-contacts'),
		targetElement = document.querySelector('.header__mobile');

	if (window.innerWidth < 765) {
		targetElement.insertAdjacentElement('beforeend', firstElement);
		targetElement.insertAdjacentElement('beforeend', secondElement);
	}
};

moveMenuElemnts();

const burger = () => {
	const burgerBtn = document.querySelector('.menu-btn'),
		menu = document.querySelector('.header__mobile');

	burgerBtn.addEventListener('click', e => {
		e.preventDefault();

		menu.classList.toggle('header__mobile--active');
		burgerBtn.classList.toggle('menu-btn_active');
	});

	document.addEventListener('click', event => {
		const target = event.target;

		if (
			(!target.closest('.header__mobile') && !target.closest('.menu-btn')) ||
			target.closest('.header-nav>li>a') ||
			target.closest('.header-contacts>div>a')
		) {
			menu.classList.remove('header__mobile--active');
			burgerBtn.classList.remove('menu-btn_active');
		}
	});

	document.addEventListener('keyup', e => {
		const target = e.key;

		if (target === 'Escape') {
			menu.classList.remove('header__mobile--active');
			burgerBtn.classList.remove('menu-btn_active');
		}
	});
};

burger();
