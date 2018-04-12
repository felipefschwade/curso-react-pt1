import React, { Component } from 'react';
import InputCustomizado from './InputCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from '../TratadorErros'
import $ from 'jquery';

class FormularioLivro extends Component {
  constructor() {
    super();
    this.state = {
      titulo: '',
      preco: '',
      autorId: '',
      msgErro: '',
    };
    this.setTitulo = this.setTitulo.bind(this);
    this.setPreco = this.setPreco.bind(this);
    this.setAutorId = this.setAutorId.bind(this);
    this.enviaForm = this.enviaForm.bind(this);
  }

  setTitulo(event) {
    this.setState({titulo: event.target.value});
  }

  setPreco(event) {
    this.setState({preco: event.target.value});
  }

  setAutorId(event) {
    this.setState({autorId: event.target.value});
  }

  componentDidMount() {
    PubSub.subscribe("erro-validacao",(topico,erro) => {            
        if(erro.field === 'autorId'){
          this.setState({msgErro:erro.defaultMessage});            
        }
    });
}

  enviaForm(evento) {
    evento.preventDefault();    
    $.ajax({
      url:'http://localhost:8080/api/livros',
      contentType:'application/json',
      dataType:'json',
      type:'post',
      data: JSON.stringify({titulo:this.state.titulo, preco:this.state.preco, autorId:this.state.autorId}),
      success: function(novaListagem){
        PubSub.publish('atualiza-lista-livros', novaListagem);        
        this.setState({titulo:'', preco:'', autorId:''});
      }.bind(this),
      error: function(resposta){
        if(resposta.status === 400) {
          new TratadorErros().publicaErros(resposta.responseJSON);
        }
      },
      beforeSend: function(){
        PubSub.publish("limpa-erros",{});
      }      
    });
  }

  render() {
    return (
      <div className="pure-form pure-form-aligned">
          <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
            <InputCustomizado id="titulo" label="Titulo" name="titulo" type="text" value={this.state.titulo} onChange={this.setTitulo} />
            <InputCustomizado id="preco" label="Preco" name="preco" type="text" value={this.state.preco} onChange={this.setPreco}/>
            <div className="pure-control-group">
                <label htmlFor="autoresId">Autor</label> 
                <select id="autoresId" value={this.state.autorId} name="autorId" onChange={this.setAutorId}>
                  <option value="">Selecione</option>
                  {
                    this.props.listaAutores.map(autor => {
                      return (
                        <option key={autor.id} value={autor.id}>{autor.nome}</option>
                      )
                    })
                  }
                </select>
                <span>{this.state.msgErro}</span>  
            </div>
            <div className="pure-control-group">                                  
              <label></label> 
              <button type="submit" className="pure-button pure-button-primary">Gravar</button>                                    
            </div>
          </form>             
        </div>  
    );
  }
}

class TabelaLivros extends Component {
  render() {
    return(
      <div>
        <table className="pure-table">
          <thead>
            <tr>
              <th>Titulo</th>
              <th>Preço</th>
              <th>Autor</th>
            </tr>
          </thead>
            <tbody>
              {
                this.props.lista.map(livro => {
                  return (
                    <tr key={livro.id}>
                      <td>{livro.titulo}</td>
                      <td>{livro.preco}</td>
                      <td>{livro.autor.nome}</td>
                    </tr>
                  )
                })
              }
            </tbody>
        </table>       
      </div>
    );
  }
}

export default class LivrosBox extends Component {
  constructor() {
    super();
    this.state = {listaLivros: [], listaAutores: []};
  }

  componentDidMount() {
    $.ajax({
      url:'http://localhost:8080/api/livros',
      dataType: 'json',
      success: function(resposta) {
        this.setState({listaLivros:resposta})
      }.bind(this)
    });

    $.ajax({
      url:'http://localhost:8080/api/autores',
      dataType: 'json',
      success: function(resposta) {
        this.setState({listaAutores:resposta})
      }.bind(this)
    });


    PubSub.subscribe('atualiza-lista-livros',function(topico,novaLista){
      this.setState({listaLivros:novaLista});
    }.bind(this));
  }

  render() {
    return(
      <div>
        <div className="header">
          <h1>Cadastro de Livros</h1>
        </div>
        <div className="content" id="content">                            
          <FormularioLivro listaAutores={this.state.listaAutores}/>
          <TabelaLivros lista={this.state.listaLivros}/>        
        </div>    
      </div>
    )
  }
}