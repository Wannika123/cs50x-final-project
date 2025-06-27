import CircleAndBtnsWrapper from "./components/CircleAndBtnsWrapper";
import Keyboard from "./components/Keyboard";
import SelectContainer from "./components/SelectsContainer";
import { SoundProvider } from "./context/SoundContext";

function App() {
    return (
        <>
            <main>
                <h1>Circle of Fifth</h1>
                <SoundProvider>
                    <Keyboard />
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr auto 1fr",
                            alignItems: "center",
                            justifyItems: "center",
                            gap: 80,
                        }}
                    >
                        <SelectContainer />
                        <CircleAndBtnsWrapper />
                    </div>
                </SoundProvider>
            </main>
            <footer>
                This is{" "}
                <a href="https://cs50.harvard.edu/x/2025/" target="_blank">
                    CS50x
                </a>{" "}
                final project by{" "}
                <a href="https://github.com/Wannika123" target="_blank">
                    Wannika
                </a>
                .
            </footer>
        </>
    );
}

export default App;
