package rebootedmvp;

import jakarta.persistence.Embeddable;

@Embeddable
public class Match {

    private String first;

    private String second;

    // No-argument constructor required by JPA
    public Match() {
    }

    public Match(String first, String second) {
        this.first = first;
        this.second = second;
    }

    public String getFirst() {
        return first;
    }

    public String getSecond() {
        return second;
    }

    public void setFirst(String first) {
        this.first = first;
    }

    public void setSecond(String second) {
        this.second = second;
    }
}
