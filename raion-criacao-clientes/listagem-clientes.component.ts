/* eslint-disable @typescript-eslint/member-ordering */
import { MatDialog } from "@angular/material/dialog";
import { Component, OnInit, ViewChild } from "@angular/core";
import {
  Dialog,
  PaginaSimples,
} from "app/modules/services/abstractPages/abstractPage";
import { DeleteModalComponent } from "../delete-modal/delete-modal.component";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { ClienteService } from "app/modules/services/clientes";
import _ from "lodash";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-clientes",
  templateUrl: "./clientes.component.html",
  styleUrls: ["./clientes.component.scss"],
})
export class ListagemClientesComponent extends PaginaSimples implements OnInit {
  @ViewChild("paginator") paginator: MatPaginator;
  displayedColumns: string[] = ["nome", "cnpj", "uf", "createdAt", "id"];
  public clientes: any = [];
  public cliente: any;
  pesquisaStr: string = "";
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
          this.toast.success("Cliente deletado com sucesso");
        }),
    });
  }
  ListaDeclintes = [];

  pesquisa(nome: string): void {
    this.pesquisaStr = nome;
    if (nome !== "") {
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
