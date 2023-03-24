import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CnpjCpfValidator } from 'app/modules/services/utils/CnpjCpfValidator';
import * as _ from 'lodash';

const fb = new FormBuilder();

export const acessoFormulario = fb.group({
    acessos: '',
    fornecedor: '',
});

export const garagemFormulario = fb.group({
    cep: ['', Validators.required],
    nome: [
        '',
        [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
        ],
    ],
    cnpj: ['', [Validators.required, CnpjCpfValidator.isValidCnpj()]],
    endereco: [
        '',
        [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
        ],
    ],
    complemento: ['N/'],
    numero: ['', Validators.required],
    municipio: [
        '',
        [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
        ],
    ],
    uf_icms: ['', Validators.required],
    acessos: fb.array([]),
});
export const contatosFormulario = fb.group({
    nome: [
        '',
        [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
        ],
    ],
    cargo: [
        '',
        [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
        ],
    ],
    telefone: [
        '',
        [
            Validators.required,
            Validators.minLength(11),
            Validators.maxLength(11),
        ],
    ],
    email: ['', [Validators.required, Validators.email]],
    observacao: [''],
});

export const clienteFormulario = (preenchido = true) =>
    fb.group({
        id: [''],
        nome: [
            '',
            [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(100),
            ],
        ],
        cnpj: ['', [Validators.required]],
        empresa_id: [
            '',
            [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(100),
            ],
        ],
        uf: ['', Validators.required],
        consultor_id: [
            '',
            [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(100),
            ],
        ],
        contatos: fb.array(preenchido ? [contatosFormulario] : []),
        garagens: fb.array(preenchido ? [garagemFormulario] : []),
    });
