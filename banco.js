window.addEventListener('load', carregado);

var db = openDatabase('agendaContatos', '1.0', "Agenda de contatos", 2 * 1024 * 1024);

db.transaction(function(tx){
    tx.executeSql("CREATE TABLE IF NOT EXISTS contato (id INTEGER PRIMARY KEY, nome TEXT, idade INTEGER)");
    tx.executeSql("CREATE TABLE IF NOT EXISTS telefone (id INTEGER PRIMARY KEY, idContato INTEGER, FOREIGN KEY(idContato) REFERENCES contato(id), numero TEXT)");
})

function carregado(){
    listar();
}

function salvar(){
    var nome = document.getElementById('nome').value;
    var idade = document.getElementById('idade').value;
    var numero = document.getElementById('telefone').value;
    var id = document.getElementById('id').value; 

    if(id){
        db.transaction(function(tx){
            tx.executeSql("UPDATE contato SET nome = ?, idade =? where id = ?", [nome, idade, id]);
            tx.executeSql("UPDATE telefone SET numero = ? WHERE idContato = ?", [numero, id]);
            console.log(nome, idade, numero, id)
        })
    } else {
        db.transaction(function(tx){
            tx.executeSql("INSERT INTO contato (nome, idade) VALUES (?, ?)", [nome, idade]);
        })

        db.transaction(function(tx){
            tx.executeSql("SELECT * FROM contato", [], (err, resultado) =>{
                id = resultado.rows.length
                console.log(id)      
                tx.executeSql("INSERT INTO telefone (idContato, numero) VALUES (?, ?)", [id, numero]);
            });

        })
    }
    listar();
};

function listar(){
    var tabela = document.getElementById('listaAgenda')

    db.transaction(function(tx){
        tx.executeSql("SELECT * FROM contato c, telefone t where t.idContato = c.id ", [], (err, resultado) =>{
            var rows = resultado.rows;
            var tr = '';
           
            for(var i = 0; i < rows.length; i++){
                tr += '<tr>';
                tr += '<td onClick="return atualizar(' + rows[i].id + ')"><img src="edit.png" width = 20 height = 20></td>'
                tr += '<td>' + rows[i].nome + '</td>';
                tr += '<td>' + rows[i].idade + '</td>';
                tr += '<td>' + rows[i].numero + '</td>';
                tr += '</tr>';
            }
            tabela.innerHTML = tr;
            
        }, null)
    })
}

function atualizar(_id){
    var id = document.getElementById('id');
    var nome = document.getElementById('nome');
    var idade = document.getElementById('idade');
    var telefone = document.getElementById('telefone');
    // console.log("chamou")
    id.value = _id;
    db.transaction(function(tx){
        console.log(_id)
        tx.executeSql('SELECT * FROM contato c, telefone t WHERE t.idContato = ? AND c.id = ?', [_id, _id], function(tx, resultado){
            var rows = resultado.rows[0];
            nome.value = rows.nome;
            idade.value = rows.idade;
            telefone.value = rows.numero;
        })
    })
}

function buscar(){
    var tabela = document.getElementById('listaAgenda')
    var nome = document.getElementById('nome').value
    var numero = document.getElementById('telefone').value

    db.transaction(function(tx){
        tx.executeSql("SELECT * FROM contato c, telefone t where c.nome = ? AND  t.numero = ? AND t.idContato = c.id", [nome, numero], (err, resultado) =>{
            var rows = resultado.rows;
            var tr = '';
            console.log(resultado)
            for(var i = 0; i < rows.length; i++){
                tr += '<tr>';
                tr += '<td><img src="edit.png"></td>'
                tr += '<td onClick="return atualizar(' + rows[i].id + ')"><img src="edit.png" width = 20 height = 20></td>'
                tr += '<td>' + rows[i].idade + '</td>';
                tr += '<td>' + rows[i].numero + '</td>';
                tr += '</tr>';
            }
            tabela.innerHTML = tr;
            
        }, null)
    })
    
}

function excluir(){
    var id = document.getElementById('id').value;
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM contato, telefone WHERE t.idContato = ? and c.id = ?', [id, id], function(tx, resultado){
            let rows = resultado.rows[0]
        })
    })
    db.transaction(function(tx){
        console.log(id)
        tx.executeSql('DELETE FROM contato WHERE id = ? ', [id]);
        tx.executeSql('DELETE FROM telefone WHERE idContato = ? ', [id]);
    })
    let nome = document.getElementById('nome').value
    let idade = document.getElementById('idade').value
    let telefone = document.getElementById('telefone').value

    let texto  = 'ID: ' + id + '   NOME: ' + nome + '  IDADE: ' + idade + '  TELEFONE: ' + telefone + '   FOI EXCLUIDO AS: ' + Date()
    let arquivo = new Blob([texto],
        {
            type: "text/plain;charset=utf-8"
        })
    saveAs(arquivo, 'LOG' + '.txt')
    listar()
}
