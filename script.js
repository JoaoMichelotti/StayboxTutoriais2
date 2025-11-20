document.addEventListener('DOMContentLoaded', () => {

    const filterButtons = document.querySelectorAll('.chip');
    const tutorialCards = document.querySelectorAll('.tutorial-card');

    // live search
    const searchInput = document.getElementById('search');

    searchInput.addEventListener('input', () => {

        const value = searchInput.value.toLowerCase()

        if (searchInput.value.length == 0) {
            updateFilterState(initialFilterButton);
            filterTutorials('todos');
        }

        tutorialCards.forEach(card => {

            const text = card.textContent.toLocaleLowerCase()

            if (text.includes(value)) {
                card.classList.remove("hidden-card")
            } else {
                card.classList.add("hidden-card")
            }


        })


    })

    const modal = document.getElementById("tutorialModal");
    const modal_title = document.getElementById("modal_title");
    const modal_description = document.getElementById("modal_description");
    const modal_body = document.getElementById("modal_body")

    const openLinks = document.querySelectorAll(".card-link");
    const closeBtn = document.querySelector(".close");

    let tutoriais = []

    // Carrega o JSON
    fetch("tutoriais.json")
        .then(res => res.json())
        .then(data => {
        tutoriais = data;
        })
        .catch(err => console.error("Erro ao carregar JSON:", err));


    openLinks.forEach(openLink => {

       openLink.addEventListener("click", e => {

            e.preventDefault(); // impede o link de "navegar"

            const tutorialId = openLink.getAttribute("data-id");

            const tutorial = tutoriais.tutoriais.find(t => t.id == tutorialId)

            console.log("ID do tutorial clicado:", tutorial);

              if (tutorial) {
                // Monta o HTML dinamicamente
                let html = ""  
                // Se tiver conteúdo detalhado
                if (tutorial.conteudo) {
                    tutorial.conteudo.forEach(item => {
                    if (item.tipo === 'texto') {
                        if (item.valor.includes("<ul>")) {
                            html += item.valor
                        }
                        else {
                            html += `<p>${item.valor}</p>`;
                        }
                    }
                        
                    if (item.tipo === 'imagem') html += `<img src="${item.valor}" style="max-width:100%;border-radius:8px;">`;
                    });
                }

                // Se tiver vídeo
                if (tutorial.video) {
                    html += `<div class="video-container">
                                <iframe 
                                    src="${tutorial.video}"
                                    frameborder="0"
                                    loading="lazy"
                                    allowfullscreen
                                    referrerpolicy="strict-origin-when-cross-origin"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share">
                                </iframe>
                            </div>`;
                }

                
                modal_title.innerText = tutorial.titulo
                modal_description.innerHTML = tutorial.descricao

                modal_body.innerHTML = html
                
                } else {
                alert('Tutorial não encontrado!');
            }

            modal.style.display = "flex";
            document.body.style.overflow = "hidden";
        });
    })

    closeBtn.onclick = () => {
      modal.style.display = "none";
      modal_body.innerHTML = ""
      document.body.style.overflow = "auto";
    }

    window.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
        modal_body.innerHTML = ""
      }
    }

    // Função para alternar a classe de filtro
    const updateFilterState = (activeButton) => {
        // Remove a classe ativa e adiciona a classe padrão a todos
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.classList.add('default-filter');
        });
        
        // Adiciona a classe ativa ao botão clicado
        activeButton.classList.add('active');
        activeButton.classList.remove('default-filter');
    };

    // Simulação de filtragem
    const filterTutorials = (category) => {
        tutorialCards.forEach(card => {
            // Se a categoria for 'todos' OU a categoria do card for a selecionada
            if (searchInput.value.length == 0) {
                if (category === 'todos' || card.dataset.category === category) {
                    card.classList.remove('hidden-card');
                } else {
                    card.classList.add('hidden-card');
                }
            }
        });
    };

    // Adiciona listener de clique aos botões
    filterButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const category = event.target.dataset.category;
            updateFilterState(event.target);
            filterTutorials(category);
        });
    });
    
    // Inicializa o estado de filtro para 'Todos'
    const initialFilterButton = document.querySelector('[data-category="todos"]');
    if (initialFilterButton) {
        // Garante que o estado inicial e a filtragem inicial sejam aplicados
        updateFilterState(initialFilterButton);
        filterTutorials('todos');
    }

    document.getElementById("voltarTopo").addEventListener("click", (event) => {

        event.preventDefault()

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })





    })

    
    function abrirModalPorURL() {
    // Verifica se tutoriais está disponível
        if (typeof tutoriais === 'undefined' || !tutoriais.tutoriais) {
            setTimeout(abrirModalPorURL, 100);
            return;
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const tutorialId = urlParams.get('id');
        
        if (tutorialId) {
            const linkCorrespondente = document.querySelector(`[data-id="${tutorialId}"]`);
            if (linkCorrespondente) {
                console.log(`Abrindo tutorial ${tutorialId} via URL`);
                linkCorrespondente.click();
            }
        }
    }

    abrirModalPorURL()


});
