/* eslint-disable @typescript-eslint/member-ordering */
import { CnpjCpfValidator } from "app/modules/services/utils/CnpjCpfValidator";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Component, Inject, OnInit } from "@angular/core";
import { FormArray, FormBuilder } from "@angular/forms";
import { ConsultoresService } from "app/modules/services/consultores";
import { ClienteService } from "app/modules/services/clientes";
import { CepService } from "app/modules/services/cep";
import { EmpresasService } from "app/modules/services/empresas";
import _ from "lodash";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-clientes",
  templateUrl: "./clientes.component.html",
  styleUrls: ["./clientes.component.scss"],
})
@Component({
  selector: "editar-consultor",
  templateUrl: "cliente-criar-editar.html",
  styleUrls: ["./clientes.component.scss"],
})
export class DialogoEdicaoClientesComponent
  extends DialogoCriacaoClientesComponent
  implements OnInit
{
  page = "EDITAR";

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
        "contatos"
      ) as FormArray;
      contatoControl.push(contato);
    });
  }
  adicionarAcessos(garagemIndex, garagem) {
    const acessos = (
      this.ClienteFormulario.get("garagens") as FormArray
    ).controls[garagemIndex].get("acessos") as FormArray;

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
        "garagens"
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
