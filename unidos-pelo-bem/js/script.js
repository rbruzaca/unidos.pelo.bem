// script.js

document.addEventListener('DOMContentLoaded', () => {
  const ano = new Date().getFullYear();
  document.getElementById('ano')?.textContent = ano;
  document.getElementById('ano2')?.textContent = ano;
  document.getElementById('ano3')?.textContent = ano;

  // Menu toggle buttons
  ['menuToggle','menuToggleProj','menuToggleCad'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        const nav = document.getElementById(btn.getAttribute('aria-controls')) || btn.nextElementSibling;
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        if (nav) {
          nav.style.display = expanded ? 'none' : 'block';
        }
      });
    }
  });

  // Theme toggle
  const toggle = document.getElementById('toggleTheme');
  if (toggle) {
    const saved = localStorage.getItem('unidos-theme');
    if (saved === 'dark') document.body.classList.add('dark');
    updateToggleText();
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      localStorage.setItem('unidos-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
      updateToggleText();
    });
  }

  // connect masks and form handling on cadastro page
  const cpf = document.getElementById('cpf');
  const telefone = document.getElementById('telefone');
  const cep = document.getElementById('cep');
  const dataN = document.getElementById('dataNascimento');

  if (dataN) {
    const hoje = new Date();
    const yyyy = hoje.getFullYear();
    const mm = String(hoje.getMonth()+1).padStart(2,'0');
    const dd = String(hoje.getDate()).padStart(2,'0');
    dataN.setAttribute('max', `${yyyy}-${mm}-${dd}`);
  }

  if (cpf) cpf.addEventListener('input', maskCPF);
  if (telefone) telefone.addEventListener('input', maskTelefone);
  if (cep) cep.addEventListener('input', maskCEP);

  const form = document.getElementById('form-voluntario');
  if (form) form.addEventListener('submit', handleFormSubmit);

});

function updateToggleText() {
  const toggle = document.getElementById('toggleTheme');
  if (!toggle) return;
  if (document.body.classList.contains('dark')) toggle.textContent = '☀️';
  else toggle.textContent = '🌙';
}

/* Masks */
function maskCPF(e) {
  let v = e.target.value.replace(/\D/g,'').slice(0,11);
  v = v.replace(/(\d{3})(\d)/,'$1.$2');
  v = v.replace(/(\d{3})(\d)/,'$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/,'$1-$2');
  e.target.value = v;
}
function maskTelefone(e) {
  let v = e.target.value.replace(/\D/g,'').slice(0,11);
  if (v.length > 10) {
    v = v.replace(/(\d{2})(\d{5})(\d{4})/,'($1) $2-$3');
  } else {
    v = v.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3');
  }
  e.target.value = v;
}
function maskCEP(e) {
  let v = e.target.value.replace(/\D/g,'').slice(0,8);
  v = v.replace(/(\d{5})(\d{1,3})/,'$1-$2');
  e.target.value = v;
}

/* Form handling */
function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  if (!form) return;
  if (!form.checkValidity()) {
    // set custom messages
    const fields = form.querySelectorAll('input,select,textarea');
    fields.forEach(field => {
      field.setCustomValidity('');
      if (!field.checkValidity()) {
        if (field.validity.valueMissing) field.setCustomValidity('Este campo é obrigatório.');
        else if (field.validity.typeMismatch) field.setCustomValidity('Formato inválido.');
        else if (field.validity.patternMismatch) {
          if (field.id === 'cpf') field.setCustomValidity('CPF inválido. Use 000.000.000-00');
          if (field.id === 'cep') field.setCustomValidity('CEP inválido. Use 00000-000');
          else field.setCustomValidity('Valor no formato incorreto.');
        } else field.setCustomValidity('Valor inválido.');
      }
    });
    if (!form.reportValidity()) {
      document.getElementById('formMessages').textContent = 'Revise os campos e tente novamente.';
      return;
    }
  }

  document.getElementById('formMessages').textContent = '';

  const data = new FormData(form);
  const obj = {};
  data.forEach((v,k) => {
    if (obj[k]) {
      if (!Array.isArray(obj[k])) obj[k] = [obj[k]];
      obj[k].push(v);
    } else obj[k] = v;
  });

  const db = JSON.parse(localStorage.getItem('unidos-candidatos') || '[]');
  obj.createdAt = new Date().toISOString();
  db.push(obj);
  localStorage.setItem('unidos-candidatos', JSON.stringify(db));

  alert('Candidatura enviada com sucesso! Obrigado.');
  form.reset();
}
