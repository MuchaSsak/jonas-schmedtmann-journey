// Demo mode: a tiny local stand-in for the OMDb API, so the app runs without
// an API key. `mockOmdbFetch` answers the same "?s=<query>" and "?i=<id>"
// requests the app used to send to omdbapi.com, with a short fake delay.

const MOVIES = [
  ["tt0816692", "Interstellar", "2014", "07 Nov 2014", "169 min", "Adventure, Drama, Sci-Fi", "Christopher Nolan", "Matthew McConaughey, Anne Hathaway, Jessica Chastain", "8.7", "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans."],
  ["tt1375666", "Inception", "2010", "16 Jul 2010", "148 min", "Action, Adventure, Sci-Fi", "Christopher Nolan", "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page", "8.8", "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O."],
  ["tt0468569", "The Dark Knight", "2008", "18 Jul 2008", "152 min", "Action, Crime, Drama", "Christopher Nolan", "Christian Bale, Heath Ledger, Aaron Eckhart", "9.0", "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice."],
  ["tt0372784", "Batman Begins", "2005", "15 Jun 2005", "140 min", "Action, Crime, Drama", "Christopher Nolan", "Christian Bale, Michael Caine, Ken Watanabe", "8.2", "After witnessing his parents' death, Bruce learns the art of fighting to confront injustice. When he returns to Gotham as Batman, he must stop a secret society that intends to destroy the city."],
  ["tt1345836", "The Dark Knight Rises", "2012", "20 Jul 2012", "164 min", "Action, Drama, Thriller", "Christopher Nolan", "Christian Bale, Tom Hardy, Anne Hathaway", "8.4", "Eight years after the Joker's reign of chaos, Batman is coerced out of exile with the assistance of the mysterious Selina Kyle in order to defend Gotham City from the vicious guerrilla terrorist Bane."],
  ["tt1877830", "The Batman", "2022", "04 Mar 2022", "176 min", "Action, Crime, Drama", "Matt Reeves", "Robert Pattinson, Zoë Kravitz, Jeffrey Wright", "7.8", "When a sadistic serial killer begins murdering key political figures in Gotham, the Batman is forced to investigate the city's hidden corruption and question his family's involvement."],
  ["tt0133093", "The Matrix", "1999", "31 Mar 1999", "136 min", "Action, Sci-Fi", "Lana Wachowski, Lilly Wachowski", "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss", "8.7", "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth: the life he knows is the elaborate deception of an evil cyber-intelligence."],
  ["tt0234215", "The Matrix Reloaded", "2003", "15 May 2003", "138 min", "Action, Sci-Fi", "Lana Wachowski, Lilly Wachowski", "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss", "7.2", "Freedom fighters Neo, Trinity and Morpheus continue to lead the revolt against the Machine Army, unleashing their arsenal of extraordinary skills and weaponry against the systematic forces of repression."],
  ["tt0242653", "The Matrix Revolutions", "2003", "05 Nov 2003", "129 min", "Action, Sci-Fi", "Lana Wachowski, Lilly Wachowski", "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss", "6.7", "The human city of Zion defends itself against the massive invasion of the machines as Neo fights to end the war at another front while also opposing the rogue Agent Smith."],
  ["tt6751668", "Parasite", "2019", "08 Nov 2019", "132 min", "Drama, Thriller", "Bong Joon Ho", "Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong", "8.5", "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan."],
  ["tt0088763", "Back to the Future", "1985", "03 Jul 1985", "116 min", "Adventure, Comedy, Sci-Fi", "Robert Zemeckis", "Michael J. Fox, Christopher Lloyd, Lea Thompson", "8.5", "Marty McFly, a 17-year-old high school student, is accidentally sent 30 years into the past in a time-traveling DeLorean invented by his close friend, the maverick scientist Doc Brown."],
  ["tt0096874", "Back to the Future Part II", "1989", "22 Nov 1989", "108 min", "Adventure, Comedy, Sci-Fi", "Robert Zemeckis", "Michael J. Fox, Christopher Lloyd, Lea Thompson", "7.8", "After visiting 2015, Marty McFly must repeat his visit to 1955 to prevent disastrous changes to 1985, without interfering with his first trip."],
  ["tt0099088", "Back to the Future Part III", "1990", "25 May 1990", "118 min", "Adventure, Comedy, Sci-Fi", "Robert Zemeckis", "Michael J. Fox, Christopher Lloyd, Mary Steenburgen", "7.5", "Stranded in 1955, Marty McFly learns about the death of Doc Brown in 1885 and must travel back in time to save him."],
  ["tt0076759", "Star Wars: Episode IV - A New Hope", "1977", "25 May 1977", "121 min", "Action, Adventure, Fantasy", "George Lucas", "Mark Hamill, Harrison Ford, Carrie Fisher", "8.6", "Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee and two droids to save the galaxy from the Empire's world-destroying battle station."],
  ["tt0080684", "Star Wars: Episode V - The Empire Strikes Back", "1980", "20 Jun 1980", "124 min", "Action, Adventure, Fantasy", "Irvin Kershner", "Mark Hamill, Harrison Ford, Carrie Fisher", "8.7", "After the Rebels are overpowered by the Empire, Luke Skywalker begins his Jedi training with Yoda, while his friends are pursued across the galaxy by Darth Vader and bounty hunter Boba Fett."],
  ["tt0086190", "Star Wars: Episode VI - Return of the Jedi", "1983", "25 May 1983", "131 min", "Action, Adventure, Fantasy", "Richard Marquand", "Mark Hamill, Harrison Ford, Carrie Fisher", "8.3", "After rescuing Han Solo from Jabba the Hutt, the Rebels attempt to destroy the second Death Star, while Luke struggles to help Darth Vader back from the dark side."],
  ["tt2488496", "Star Wars: Episode VII - The Force Awakens", "2015", "18 Dec 2015", "138 min", "Action, Adventure, Sci-Fi", "J.J. Abrams", "Daisy Ridley, John Boyega, Oscar Isaac", "7.8", "As a new threat to the galaxy rises, Rey, a desert scavenger, and Finn, an ex-stormtrooper, must join Han Solo and Chewbacca to search for the one hope of restoring peace."],
  ["tt0120737", "The Lord of the Rings: The Fellowship of the Ring", "2001", "19 Dec 2001", "178 min", "Action, Adventure, Drama", "Peter Jackson", "Elijah Wood, Ian McKellen, Orlando Bloom", "8.9", "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron."],
  ["tt0167261", "The Lord of the Rings: The Two Towers", "2002", "18 Dec 2002", "179 min", "Action, Adventure, Drama", "Peter Jackson", "Elijah Wood, Ian McKellen, Viggo Mortensen", "8.8", "While Frodo and Sam edge closer to Mordor with the help of the shifty Gollum, the divided fellowship makes a stand against Sauron's new ally, Saruman, and his hordes of Isengard."],
  ["tt0167260", "The Lord of the Rings: The Return of the King", "2003", "17 Dec 2003", "201 min", "Action, Adventure, Drama", "Peter Jackson", "Elijah Wood, Viggo Mortensen, Ian McKellen", "9.0", "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring."],
  ["tt0241527", "Harry Potter and the Sorcerer's Stone", "2001", "16 Nov 2001", "152 min", "Adventure, Family, Fantasy", "Chris Columbus", "Daniel Radcliffe, Rupert Grint, Richard Harris", "7.6", "An orphaned boy enrolls in a school of wizardry, where he learns the truth about himself, his family and the terrible evil that haunts the magical world."],
  ["tt0295297", "Harry Potter and the Chamber of Secrets", "2002", "15 Nov 2002", "161 min", "Adventure, Family, Fantasy", "Chris Columbus", "Daniel Radcliffe, Rupert Grint, Emma Watson", "7.4", "An ancient prophecy seems to be coming true when a mysterious presence begins stalking the corridors of a school of magic and leaving its victims paralyzed."],
  ["tt0304141", "Harry Potter and the Prisoner of Azkaban", "2004", "04 Jun 2004", "142 min", "Adventure, Family, Fantasy", "Alfonso Cuarón", "Daniel Radcliffe, Emma Watson, Rupert Grint", "7.9", "Harry Potter, Ron and Hermione return to Hogwarts School of Witchcraft and Wizardry for their third year of study, where they delve into the mystery surrounding an escaped prisoner."],
  ["tt0848228", "The Avengers", "2012", "04 May 2012", "143 min", "Action, Sci-Fi", "Joss Whedon", "Robert Downey Jr., Chris Evans, Scarlett Johansson", "8.0", "Earth's mightiest heroes must come together and learn to fight as a team if they are going to stop the mischievous Loki and his alien army from enslaving humanity."],
  ["tt4154756", "Avengers: Infinity War", "2018", "27 Apr 2018", "149 min", "Action, Adventure, Sci-Fi", "Anthony Russo, Joe Russo", "Robert Downey Jr., Chris Hemsworth, Mark Ruffalo", "8.4", "The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos before his blitz of devastation and ruin puts an end to the universe."],
  ["tt4154796", "Avengers: Endgame", "2019", "26 Apr 2019", "181 min", "Action, Adventure, Drama", "Anthony Russo, Joe Russo", "Robert Downey Jr., Chris Evans, Mark Ruffalo", "8.4", "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions."],
  ["tt0114709", "Toy Story", "1995", "22 Nov 1995", "81 min", "Animation, Adventure, Comedy", "John Lasseter", "Tom Hanks, Tim Allen, Don Rickles", "8.3", "A cowboy doll is profoundly threatened and jealous when a new spaceman action figure supplants him as top toy in a boy's bedroom."],
  ["tt0120363", "Toy Story 2", "1999", "24 Nov 1999", "92 min", "Animation, Adventure, Comedy", "John Lasseter", "Tom Hanks, Tim Allen, Joan Cusack", "7.9", "When Woody is stolen by a toy collector, Buzz and his friends set out on a rescue mission to save Woody before he becomes a museum toy property."],
  ["tt0435761", "Toy Story 3", "2010", "18 Jun 2010", "103 min", "Animation, Adventure, Comedy", "Lee Unkrich", "Tom Hanks, Tim Allen, Joan Cusack", "8.3", "The toys are mistakenly delivered to a day-care center instead of the attic right before Andy leaves for college, and it's up to Woody to convince the other toys that they weren't abandoned."],
  ["tt0107290", "Jurassic Park", "1993", "11 Jun 1993", "127 min", "Action, Adventure, Sci-Fi", "Steven Spielberg", "Sam Neill, Laura Dern, Jeff Goldblum", "8.2", "An industrialist invites some experts to visit his theme park of cloned dinosaurs. After a power failure, the creatures run loose, putting everyone's lives, including his grandchildren's, in danger."],
  ["tt0068646", "The Godfather", "1972", "24 Mar 1972", "175 min", "Crime, Drama", "Francis Ford Coppola", "Marlon Brando, Al Pacino, James Caan", "9.2", "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son."],
  ["tt0071562", "The Godfather Part II", "1974", "18 Dec 1974", "202 min", "Crime, Drama", "Francis Ford Coppola", "Al Pacino, Robert De Niro, Robert Duvall", "9.0", "The early life and career of Vito Corleone in 1920s New York City is portrayed, while his son, Michael, expands and tightens his grip on the family crime syndicate."],
  ["tt0111161", "The Shawshank Redemption", "1994", "14 Oct 1994", "142 min", "Drama", "Frank Darabont", "Tim Robbins, Morgan Freeman, Bob Gunton", "9.3", "A banker convicted of uxoricide forms a friendship over a quarter century with a hardened convict, while maintaining his innocence and trying to remain hopeful through simple compassion."],
  ["tt0109830", "Forrest Gump", "1994", "06 Jul 1994", "142 min", "Drama, Romance", "Robert Zemeckis", "Tom Hanks, Robin Wright, Gary Sinise", "8.8", "The history of the United States from the 1950s to the '70s unfolds from the perspective of an Alabama man with an IQ of 75, who yearns to be reunited with his childhood sweetheart."],
  ["tt0137523", "Fight Club", "1999", "15 Oct 1999", "139 min", "Drama", "David Fincher", "Brad Pitt, Edward Norton, Meat Loaf", "8.8", "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more."],
  ["tt0110912", "Pulp Fiction", "1994", "14 Oct 1994", "154 min", "Crime, Drama", "Quentin Tarantino", "John Travolta, Uma Thurman, Samuel L. Jackson", "8.9", "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption."],
  ["tt15398776", "Oppenheimer", "2023", "21 Jul 2023", "180 min", "Biography, Drama, History", "Christopher Nolan", "Cillian Murphy, Emily Blunt, Matt Damon", "8.3", "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb."],
  ["tt1160419", "Dune: Part One", "2021", "22 Oct 2021", "155 min", "Action, Adventure, Drama", "Denis Villeneuve", "Timothée Chalamet, Rebecca Ferguson, Zendaya", "8.0", "A noble family becomes embroiled in a war for control over the galaxy's most valuable asset while its heir becomes troubled by visions of a dark future."],
  ["tt15239678", "Dune: Part Two", "2024", "01 Mar 2024", "166 min", "Action, Adventure, Drama", "Denis Villeneuve", "Timothée Chalamet, Zendaya, Rebecca Ferguson", "8.5", "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family."],
  ["tt2380307", "Coco", "2017", "22 Nov 2017", "105 min", "Animation, Adventure, Drama", "Lee Unkrich, Adrian Molina", "Anthony Gonzalez, Gael García Bernal, Benjamin Bratt", "8.4", "Aspiring musician Miguel, confronted with his family's ancestral ban on music, enters the Land of the Dead to find his great-great-grandfather, a legendary singer."],
  ["tt0910970", "WALL·E", "2008", "27 Jun 2008", "98 min", "Animation, Adventure, Family", "Andrew Stanton", "Ben Burtt, Elissa Knight, Jeff Garlin", "8.4", "A robot who is responsible for cleaning a waste-covered Earth meets another robot and falls in love with her. Together, they set out on a journey that will alter the fate of mankind."],
].map(([imdbID, Title, Year, Released, Runtime, Genre, Director, Actors, imdbRating, Plot]) => ({
  imdbID, Title, Year, Released, Runtime, Genre, Director, Actors, imdbRating, Plot,
  Type: "movie",
  Poster: poster(Title, Year),
  Response: "True",
}));

// Simple generated poster, so no third-party images are needed
function poster(title, year) {
  let hash = 0;
  for (const char of title) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  const words = title.replace(/[:\-–]/g, " ").split(/\s+/).filter(Boolean);
  const lines = [];
  for (const word of words) {
    const last = lines[lines.length - 1];
    if (last && (last + " " + word).length <= 14) lines[lines.length - 1] += " " + word;
    else lines.push(word);
  }
  const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const text = lines
    .slice(0, 5)
    .map((line, i) => `<text x="150" y="${190 + i * 34 - lines.slice(0, 5).length * 17}" font-size="28">${escape(line)}</text>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="444" viewBox="0 0 300 444"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hash},55%,42%)"/><stop offset="1" stop-color="hsl(${(hash + 60) % 360},60%,16%)"/></linearGradient></defs><rect width="300" height="444" fill="url(#g)"/><g fill="#fff" font-family="Georgia,serif" font-weight="700" text-anchor="middle">${text}</g><text x="150" y="400" fill="#ffffffaa" font-family="sans-serif" font-size="20" text-anchor="middle">${year}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const wait = (ms, signal) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("The user aborted a request.", "AbortError"));
    });
  });

const json = (data) =>
  new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });

export async function mockOmdbFetch(url, { signal } = {}) {
  const params = new URL(url, "https://omdb.mock").searchParams;
  await wait(300 + Math.random() * 300, signal);

  if (params.has("i")) {
    const movie = MOVIES.find((m) => m.imdbID === params.get("i"));
    return json(movie ?? { Response: "False", Error: "Incorrect IMDb ID." });
  }

  const query = (params.get("s") ?? "").trim().toLowerCase();
  const results = MOVIES.filter((m) => m.Title.toLowerCase().includes(query))
    .slice(0, 10)
    .map(({ Title, Year, imdbID, Type, Poster }) => ({ Title, Year, imdbID, Type, Poster }));

  if (results.length === 0) return json({ Response: "False", Error: "Movie not found!" });
  return json({ Search: results, totalResults: String(results.length), Response: "True" });
}
