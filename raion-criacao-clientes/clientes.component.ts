/* eslint-disable @typescript-eslint/member-ordering */
import { CnpjCpfValidator } from 'app/modules/services/utils/CnpjCpfValidator';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    Dialog,
    PaginaSimples,
} from 'app/modules/services/abstractPages/abstractPage';
import { ConsultoresService } from 'app/modules/services/consultores';
import { DeleteModalComponent } from '../delete-modal/delete-modal.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ClienteService } from 'app/modules/services/clientes';
import { CepService } from 'app/modules/services/cep';
import { EmpresasService } from 'app/modules/services/empresas';
import _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import estados from 'app/modules/services/utils/estados';
import { fornecedoresFiltrados } from 'app/modules/services/utils/tributos';
import {
    acessoFormulario,
    clienteFormulario,
    contatosFormulario,
    garagemFormulario,
} from './forms';

@Component({
    selector: 'app-clientes',
    templateUrl: './clientes.component.html',
    styleUrls: ['./clientes.component.scss'],
})
export class ClientesComponent extends PaginaSimples implements OnInit {
    @ViewChild('paginator') paginator: MatPaginator;
    displayedColumns: string[] = ['nome', 'cnpj', 'uf', 'createdAt', 'id'];
    public clientes: any = [];
    public cliente: any;
    pesquisaStr: string = '';
    constructor(
        public dialog: MatDialog,
        private clienteService: ClienteService,
        public toast: ToastrService
    ) {
        super();
    }

    ngOnInit(): void {
        this.requisicoes();
    }

    requisicoes(): void {
        this.clienteService.getClientes().subscribe((res: any) => {
            const sortByName = res.data.sort((a: any, b: any) =>
                a.nome.localeCompare(b.nome)
            );
            this.ListaDeclintes = sortByName;
            this.clientes = new MatTableDataSource(sortByName);
            this.clientes.paginator = this.paginator;
            this.pesquisa(this.pesquisaStr);
        });
    }
    deletar(id: string): void {
        this.dialog.open(DeleteModalComponent, {
            data: () =>
                this.clienteService.deleteClientes(id).subscribe(() => {
                    this.requisicoes();
                    this.dialog.closeAll();
                    this.toast.success('Cliente deletado com sucesso');
                }),
        });
    }
    ListaDeclintes = [];

    pesquisa(nome: string): void {
        this.pesquisaStr = nome;
        if (nome !== '') {
            this.clientes = new MatTableDataSource(
                this.ListaDeclintes.filter((c) =>
                    c.nome.toLowerCase().includes(nome.toLowerCase())
                )
            );
            this.clientes.paginator = this.paginator;
        } else {
            this.clientes = new MatTableDataSource(this.ListaDeclintes);
            this.clientes.paginator = this.paginator;
        }
    }

    dialogoEdicao(cliente: any): void {
        this.cliente = cliente;
        const dialogRef = this.dialog.open(DialogoEdicaoClientesComponent, {
            data: {
                cliente,
                req: () => {
                    this.dialog.closeAll();
                    this.requisicoes();
                    this.toast.success('Cliente editado com sucesso');
                },
            },
            width: '75%',
        });

        dialogRef.afterClosed().subscribe((result) => {
            // this.requisicoes();
        });
    }
    dialogoCriacao(): void {
        const dialogRef = this.dialog.open(DialogoCriacaoClientesComponent, {
            data: () => {
                this.dialog.closeAll();
                this.requisicoes();
                this.toast.success('Cliente criado com sucesso');
            },
            width: '75%',
        });

        dialogRef.afterClosed().subscribe(() => {
            // this.requisicoes();
        });
    }
}

@Component({
    selector: 'criar-consultor',
    templateUrl: 'cliente-criar-editar.html',
    styleUrls: ['./clientes.component.scss'],
})
export class DialogoCriacaoClientesComponent extends Dialog implements OnInit {
    fornecedores = fornecedoresFiltrados;
    consultores: any = [];
    empresas: any = [];
    ufs: any = estados;
    ClienteFormulario: FormGroup;

    page = 'CRIAR';
    constructor(
        public fb: FormBuilder,
        public empresasService: EmpresasService,
        public consultoresService: ConsultoresService,
        private cepService: CepService,
        public clienteService: ClienteService,
        public toast: ToastrService,
        public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        super();
    }

    // para criar um novo cliente ele por padrão deve possuir um contato e uma garagem vazias
    ngOnInit(): void {
        this.requisicoes();
        this.ClienteFormulario = this.initCliente();
    }

    initCliente(preenchido = true): FormGroup {
        const cliente = _.cloneDeep(clienteFormulario(preenchido));
        cliente.reset();
        return cliente;
    }
    /**
     * @returns formulário de contato
     */
    initContato(): FormGroup {
        const contato = _.cloneDeep(contatosFormulario);
        contato.reset();
        return contato;
    }
    /**
     * @returns formulário de garagem
     */
    initGaragem(): FormGroup {
        const garagem = _.cloneDeep(garagemFormulario);
        garagem.reset();
        garagem.patchValue({
            acessos: [this.initAcesso()],
        });
        return garagem;
    }

    /**
     * @returns formulário de acesso
     */
    initAcesso(): FormGroup {
        const acesso = _.cloneDeep(acessoFormulario);
        acesso.reset();
        return acesso;
    }

    /**
     * @param  form precisa sem do tipo FormGroup de cliente
     * @returns contatos inclusos no formulario do cliente
     */
    getContatos(form): FormArray<FormGroup> {
        return form.controls.contatos.controls;
    }
    /**
     * @param  form precisa sem do tipo FormGroup de garagem
     * @returns acessos inclusos no formulario de garagem
     */
    getAcessos(form): FormArray<FormGroup> {
        return form.controls.acessos.controls;
    }
    /**
     * @param  form precisa sem do tipo FormGroup de cliente
     * @returns garagens inclusas no formulario do cliente
     */
    getGaragens(form): FormArray<FormGroup> {
        return form.controls.garagens.controls;
    }

    /**
     * Ao submeter formulário a função é chamada e exibi error no caso de qualquer falha das validações
     */
    ExibirErrosDeFormulário(form: FormGroup): void {
        if (form.invalid) {
            if (form.controls.contatos.invalid) {
                this.toast.error('Dados de contato incompletos');
                return;
            }
            if (form.controls.garagens.invalid) {
                this.toast.error('Dados de garagem incompletos');
                return;
            }
            this.toast.error('Dados incompletos');
        }
    }

    /**
     * Requisições feitas para preencher selects de empresas e consutores no html
     */
    requisicoes(): void {
        this.empresasService.getEmpresas().subscribe((response) => {
            this.empresas = response.data;
        });
        this.consultoresService.getConsultores().subscribe((response) => {
            this.consultores = response.data;
        });
    }

    /**
     * Função acionada ao adicionar um novo contato no html
     * e inclui um novo contato ao cliente
     */
    addContato(): void {
        const control = this.ClienteFormulario.get('contatos') as FormArray;
        control.push(this.initContato());
    }
    /**
     * Função acionada ao adicionar um novo acesso no html
     * e inclui um novo acesso a uma determinada garagem do cliente
     */
    addAcessos(i): void {
        const control = (
            this.ClienteFormulario.get('garagens') as FormArray
        ).controls[i].get('acessos') as FormArray;
        control.push(this.initAcesso());
    }
    /**
     * Função acionada ao adicionar uma nova garagem no html
     * e inclui uma nova garagem ao cliente
     */
    addGaragem(): void {
        const control = this.ClienteFormulario.get('garagens') as FormArray;
        control.push(this.initGaragem());
    }
    /**
     * Função que preenche cep de uma garagem específica do cliente,
     * acionada ao digitar
     */
    obterCep(cep: any, index: number): any {
        if (cep.value >= 7) {
            this.cepService.getCep(cep.value).subscribe((result: any) => {
                const controlsGaragem =
                    this.ClienteFormulario.controls['garagens'];
                controlsGaragem.get([index])?.patchValue({
                    endereco: result.street,
                    municipio: result.city,
                    uf_icms: result.state,
                });
            });
        } else {
            return false;
        }
    }

    deleteGaragem(indiceGaragem: number): void {
        const garagemArray = this.ClienteFormulario.get(
            'garagens'
        ) as FormArray;
        garagemArray.removeAt(indiceGaragem);
    }
    deleteAcesso(indiceGaragem: number, indiceAcesso: number): void {
        const AcessoArray = (
            this.ClienteFormulario.get('garagens') as FormArray
        ).controls[indiceGaragem].get('acessos') as FormArray;
        AcessoArray.removeAt(indiceAcesso);
    }
    deleteContato(contatoIndice: number): void {
        const contatoArray = this.ClienteFormulario.get(
            'contatos'
        ) as FormArray;
        contatoArray.removeAt(contatoIndice);
    }

    onSubmit(): void {
        this.ClienteFormulario.controls.garagens.markAllAsTouched();
        this.ClienteFormulario.controls.contatos.markAllAsTouched();
        this.ExibirErrosDeFormulário(this.ClienteFormulario);

        if (!this.ClienteFormulario.invalid) {
            const result = this.ClienteFormulario.value;
            result.cnpj = CnpjCpfValidator.format(
                this.ClienteFormulario.value.cnpj
            );
            this.clienteService.postCliente(result).subscribe(() => {
                this.data();
            });
        }
    }
}

@Component({
    selector: 'editar-consultor',
    templateUrl: 'cliente-criar-editar.html',
    styleUrls: ['./clientes.component.scss'],
})
export class DialogoEdicaoClientesComponent
    extends DialogoCriacaoClientesComponent
    implements OnInit
{
    page = 'EDITAR';

    constructor(
        public override fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any,
        empresasService: EmpresasService,
        consultoresService: ConsultoresService,
        cepService: CepService,
        clienteService: ClienteService,
        public toast: ToastrService,
        public dialog: MatDialog
    ) {
        super(
            fb,
            empresasService,
            consultoresService,
            cepService,
            clienteService,
            toast,
            dialog,
            data
        );
    }

    override async ngOnInit() {
        this.requisicoes();
        this.ClienteFormulario = _.cloneDeep(this.initCliente(false));
        const { cliente } = this.data;

        this.adicionarContatos(cliente);
        this.adicionarGaragens(cliente);
        this.ClienteFormulario.patchValue({
            id: cliente.id,
            nome: cliente.nome,
            cnpj: cliente.cnpj,
            empresa_id: cliente.empresa.id,
            uf: cliente.uf,
            consultor_id: cliente.consultor.id,
        });
    }
    adicionarContatos(clienteSelecionado) {
        clienteSelecionado.contatos.forEach((data: any) => {
            const contato = this.initContato();
            contato.patchValue({
                nome: data.nome,
                cargo: data.cargo,
                telefone: data.telefone,
                email: data.email,
                observacao: data.observacao,
            });
            const contatoControl = this.ClienteFormulario.get(
                'contatos'
            ) as FormArray;
            contatoControl.push(contato);
        });
    }
    adicionarAcessos(garagemIndex, garagem) {
        const acessos = (
            this.ClienteFormulario.get('garagens') as FormArray
        ).controls[garagemIndex].get('acessos') as FormArray;

        if (garagem.acessos.length > 0) {
            garagem.acessos.forEach((a) => {
                const acesso = this.initAcesso();
                acesso.patchValue({
                    acessos: a.acessos,
                    fornecedor: a?.fornecedor,
                });
                acessos.push(acesso);
            });
        } else {
            const ac = this.initAcesso();
            acessos.push(ac);
        }
    }
    adicionarGaragens(clienteSelecionado) {
        clienteSelecionado.garagens.forEach((garagem: any, garagemIndex) => {
            const garagemFormularioNovo = this.initGaragem();

            garagemFormularioNovo.patchValue({
                cep: garagem.cep,
                nome: garagem.nome,
                cnpj: garagem.cnpj,
                endereco: garagem.endereco,
                complemento: garagem.complemento,
                numero: garagem.numero,
                municipio: garagem.municipio,
                uf_icms: garagem.uf_icms,
                acessos: [],
            });

            const garagemControl = this.ClienteFormulario.get(
                'garagens'
            ) as FormArray;
            garagemControl.push(garagemFormularioNovo);

            this.adicionarAcessos(garagemIndex, garagem);
        });
    }
    override onSubmit(): void {
        const valorClienteFormulario = this.ClienteFormulario.value;
        const id = valorClienteFormulario.id;
        valorClienteFormulario.cnpj = CnpjCpfValidator.format(
            this.ClienteFormulario.value.cnpj
        );

        this.ExibirErrosDeFormulário(this.ClienteFormulario);

        if (!this.ClienteFormulario.invalid) {
            this.clienteService
                .editCliente(valorClienteFormulario, id as string)
                .subscribe(() => {
                    this.data.req();
                });
        }
    }
}
