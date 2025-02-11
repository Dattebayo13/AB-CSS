// ==UserScript==
// @name         AB Anilist Links
// @version      1.1.2
// @description  Anilist AB linker (Edited by Raven)
// @author       Dattebayo13
// @icon         https://animebytes.tv/favicon.ico
// @grant        GM_xmlhttpRequest
// @match        https://animebytes.tv/torrents.php*
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    function insertAfter(newNode, existingNode) {
        existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
    }

    let header = document.querySelectorAll('h3 a');
    header = header[header.length - 1];
    let seriesName = document.querySelectorAll('h2 a')[0].innerText;
    let seriesAnidb = document.querySelectorAll('h3 a')[0];
    let seriesMAL = document.querySelectorAll('h3 a')[3].href;
    let seriesMALid = seriesMAL.match(/anime\/(\d+)/)[1];

    document.querySelectorAll('h3 a').forEach(e => {
        $(e).attr('target', '_blank');
    });

    function createnewLink(linku, link, name, blank) {
        linku = document.createElement("a");
        linku.innerHTML = " | " + name;
        linku.href = link + seriesName;
        linku.style.fontWeight = "900";
        linku.style.fontSize = "15px";

        if (blank) {
            $(linku).attr('target', '_blank');
        }
        $(linku).insertAfter(header);
    }

    function createnewLink2(linku, link1, link2, name, blank) {
        linku = document.createElement("a");
        linku.innerHTML = " | " + name;
        linku.href = link1 + seriesAnidb + link2;
        linku.style.fontWeight = "900";
        linku.style.fontSize = "15px";

        if (blank) {
            $(linku).attr('target', '_blank');
        }
        $(linku).insertAfter(header);
    }

    function fetchAniListId(malId) {
        return new Promise((resolve, reject) => {
            const query = `query($id: Int, $type: MediaType) {
                Media(idMal: $id, type: $type) {
                    id
                }
            }`;

            const variables = {
                id: malId,
                type: "ANIME"
            };

            const url = 'https://graphql.anilist.co';

            GM_xmlhttpRequest({
                method: "POST",
                url: url,
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify({
                    query: query,
                    variables: variables
                }),
                onload: function(response) {
                    const data = JSON.parse(response.responseText);
                    const aniListId = data.data.Media.id;

                    if (aniListId) {
                        resolve(aniListId); // Resolve with the AniList ID
                    } else {
                        reject(`No AniList ID found for MAL ID ${malId}`);
                    }
                },
                onerror: function(error) {
                    reject('Error fetching AniList data:', error);
                }
            });
        });
    }

    function createLinkAnilistID(link, malId, name, blank) {
        fetchAniListId(malId)
            .then(aniListId => {
                const linku = document.createElement("a");
                linku.innerHTML = " | " + name;
                linku.href = link + aniListId; // Link to AniList using the AniList ID
                linku.style.fontWeight = "900";
                linku.style.fontSize = "15px";

                if (blank) {
                    linku.target = "_blank"; // Use native DOM method
                }
                $(linku).insertAfter(header);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    createnewLink("nyaalink", "https://nyaa.si/?f=0&c=0_0&q=", "Nyaa", true);
    createnewLink2("u2link", "https://u2.dmhy.org/torrents.php?incldead=1&spstate=0&inclbookmarked=0&search=", "&search_area=4&search_mode=2", "U2", true);
    createnewLink("tvDBlink", "https://www.thetvdb.com/search?query=", "TVDB", true);
    createnewLink("IMDBlink", "https://www.imdb.com/find?q=", "IMDB", true);
    createLinkAnilistID("https://anilist.co/anime/", seriesMALid, "Anilist", true);

})();
